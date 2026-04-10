import React, {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useContext,
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

  useEffect(() => {
    async function loadSession() {
      try {
        setIsLoading(true);
        setError(null);
        const session = await fetchActiveStudySession();

        if (session && session.samples.length > 0) {
          setSessionId(session.id);
          setSamples(session.samples);
          setCurrentIndex(0);
        } else {
          setError('No active study session found.');
        }
      } catch (err) {
        setError('Error fetching study session.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const currentSample =
    currentIndex < samples.length ? samples[currentIndex] : null;

  const nextSample = () => {
    if (currentIndex < samples.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <SampleContext.Provider
      value={{
        sessionId,
        samples,
        currentIndex,
        currentSample,
        nextSample,
        isLoading,
        error,
      }}
    >
      {children}
    </SampleContext.Provider>
  );
};
