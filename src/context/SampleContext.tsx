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

interface SampleContextType {
  sessionId: string | null;
  questionnaireTitle: string;
  questionnaireQuestions: QuestionnaireQuestion[];
  samples: string[];
  currentIndex: number;
  currentSample: string | null;
  isLoading: boolean;
  error: string | null;
  nextSample: () => void;
  retryLoadSession: () => Promise<void>;
  resetSession: () => void;
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

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await fetchActiveStudySession();

      if (session && session.samples.length > 0) {
        setSessionId(session.id);
        setQuestionnaireTitle(session.title);
        setQuestionnaireQuestions(session.questions);
        setSamples(session.samples);
        setCurrentIndex(0);
      } else {
        setSessionId(null);
        setQuestionnaireTitle('Aistinvarainen arviointi');
        setQuestionnaireQuestions([]);
        setSamples([]);
        setCurrentIndex(0);
        setError('Aktiivista tutkimusistuntoa ei löytynyt.');
      }
    } catch (err) {
      setSessionId(null);
      setQuestionnaireTitle('Aistinvarainen arviointi');
      setQuestionnaireQuestions([]);
      setSamples([]);
      setCurrentIndex(0);
      setError(
        'Istunnon haku epäonnistui. Tarkista yhteys ja yritä uudelleen.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const resetSession = () => {
    setCurrentIndex(0);
  };

  return (
    <SampleContext.Provider
      value={{
        sessionId,
        questionnaireTitle,
        questionnaireQuestions,
        samples,
        currentIndex,
        currentSample,
        nextSample,
        retryLoadSession: loadSession,
        isLoading,
        error,
        resetSession,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
