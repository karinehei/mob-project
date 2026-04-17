import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { fetchActiveStudySession } from '../services/studyService';

interface SampleContextType {
  sessionId: string | null;
  samples: string[];
  currentIndex: number;
  currentSample: string | null;
  isLoading: boolean;
  error: string | null;
  nextSample: () => void;
  retryLoadSession: () => Promise<void>;
  /** Ulkonäköpisteet 0–10; asetetaan etusivulta ennen Sample-näkymää */
  pendingAppearanceRating: number | null;
  setPendingAppearanceRating: (rating: number) => void;
  clearPendingAppearanceRating: () => void;
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
  const [samples, setSamples] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAppearanceRating, setPendingAppearanceRating] = useState<
    number | null
  >(null);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await fetchActiveStudySession();

      if (session && session.samples.length > 0) {
        setSessionId(session.id);
        setSamples(session.samples);
        setCurrentIndex(0);
      } else {
        setSessionId(null);
        setSamples([]);
        setCurrentIndex(0);
        setError('Aktiivista tutkimusistuntoa ei löytynyt.');
      }
    } catch (err) {
      setSessionId(null);
      setSamples([]);
      setCurrentIndex(0);
      setError('Istunnon haku epäonnistui. Tarkista yhteys ja yritä uudelleen.');
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

  const clearPendingAppearanceRating = () => {
    setPendingAppearanceRating(null);
  };

  return (
    <SampleContext.Provider
      value={{
        sessionId,
        samples,
        currentIndex,
        currentSample,
        nextSample,
        retryLoadSession: loadSession,
        isLoading,
        error,
        pendingAppearanceRating,
        setPendingAppearanceRating,
        clearPendingAppearanceRating,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
