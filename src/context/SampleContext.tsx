import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { fetchActiveStudySession } from '../services/studyService';
import type { QuestionnaireQuestion } from '../types/questionnaire';
import { shuffleSamples } from '../utils/shuffleSamples';

function createResponseSessionId(): string {
  return `resp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface SampleContextType {
  sessionId: string | null;
  responseSessionId: string;
  questionnaireTitle: string;
  questionnaireQuestions: QuestionnaireQuestion[];
  samples: string[];
  samplePresentationOrder: string[];
  currentIndex: number;
  currentSample: string | null;
  isLoading: boolean;
  error: string | null;
  updateStatusMessage: string | null;
  nextSample: () => void;
  retryLoadSession: () => Promise<void>;
  resetSession: () => Promise<void>;
}

export const SampleContext = createContext<SampleContextType | undefined>(
  undefined,
);

export const useSampleContext = () => {
  const context = useContext(SampleContext);
  if (!context) {
    throw new Error('useSampleContext must be used within a SampleProvider');
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const SampleProvider: React.FC<ProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [responseSessionId, setResponseSessionId] = useState<string>(
    createResponseSessionId(),
  );
  const [questionnaireTitle, setQuestionnaireTitle] = useState<string>(
    'Aistinvarainen arviointi',
  );
  const [questionnaireQuestions, setQuestionnaireQuestions] = useState<
    QuestionnaireQuestion[]
  >([]);
  const [samples, setSamples] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatusMessage, setUpdateStatusMessage] = useState<string | null>(
    null,
  );

  const loadSession = useCallback(async (betweenSessions = false) => {
    const hasCachedSession = Boolean(sessionId) && samples.length > 0;

    try {
      setIsLoading(true);
      if (!betweenSessions) {
        setError(null);
      }
      const session = await fetchActiveStudySession();

      if (session && session.samples.length > 0) {
        const shuffledSamples = shuffleSamples(session.samples);
        setSessionId(session.id);
        setResponseSessionId(createResponseSessionId());
        setQuestionnaireTitle(session.title);
        setQuestionnaireQuestions(session.questions);
        setSamples(shuffledSamples);
        setCurrentIndex(0);
        setError(null);
        setUpdateStatusMessage(null);
      } else {
        if (betweenSessions && hasCachedSession) {
          setResponseSessionId(createResponseSessionId());
          setCurrentIndex(0);
          setSamples((prev) => shuffleSamples(prev));
          setUpdateStatusMessage(
            'Kyselyn päivitystarkistus epäonnistui. Käytetään viimeksi ladattua kyselyä.',
          );
          return;
        }
        setSessionId(null);
        setQuestionnaireTitle('Aistinvarainen arviointi');
        setQuestionnaireQuestions([]);
        setSamples([]);
        setCurrentIndex(0);
        setError('Aktiivista tutkimusistuntoa ei löytynyt.');
        setUpdateStatusMessage(null);
      }
    } catch {
      if (betweenSessions && hasCachedSession) {
        setResponseSessionId(createResponseSessionId());
        setCurrentIndex(0);
        setSamples((prev) => shuffleSamples(prev));
        setUpdateStatusMessage(
          'Kyselyn päivitystarkistus epäonnistui. Käytetään viimeksi ladattua kyselyä.',
        );
      } else {
        setSessionId(null);
        setResponseSessionId(createResponseSessionId());
        setQuestionnaireTitle('Aistinvarainen arviointi');
        setQuestionnaireQuestions([]);
        setSamples([]);
        setCurrentIndex(0);
        setError(
          'Istunnon haku epäonnistui. Tarkista yhteys ja yritä uudelleen.',
        );
        setUpdateStatusMessage(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [samples.length, sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const currentSample =
    currentIndex < samples.length ? samples[currentIndex] : null;

  const nextSample = () => {
    if (currentIndex < samples.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetSession = async () => {
    await loadSession(true);
  };

  return (
    <SampleContext.Provider
      value={{
        sessionId,
        responseSessionId,
        questionnaireTitle,
        questionnaireQuestions,
        samples,
        samplePresentationOrder: samples,
        currentIndex,
        currentSample,
        nextSample,
        retryLoadSession: loadSession,
        isLoading,
        error,
        updateStatusMessage,
        resetSession,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
