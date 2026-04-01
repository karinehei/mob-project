import React, { createContext, useState, ReactNode } from 'react';

interface SampleContextType {
  samples: string[];
  currentIndex: number;
  currentSample: string | null;
  nextSample: () => void;
}

export const SampleContext = createContext<SampleContextType | undefined>(
  undefined,
);

interface ProviderProps {
  children: ReactNode;
}

export const SampleProvider: React.FC<ProviderProps> = ({ children }) => {
  // TEST DATA
  const [samples] = useState<string[]>(['451', '926', '780']);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const currentSample =
    currentIndex < samples.length ? samples[currentIndex] : null;

  const nextSample = () => {
    if (currentIndex < samples.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <SampleContext.Provider
      value={{ samples, currentIndex, currentSample, nextSample }}
    >
      {children}
    </SampleContext.Provider>
  );
};
