
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { QuranData } from '@/lib/quran-types';

interface QuranDataContextType {
  quranData: QuranData | null;
  isLoading: boolean;
  error: Error | null;
}

const QuranDataContext = createContext<QuranDataContextType | undefined>(
  undefined
);

export function QuranDataProvider({ children }: { children: ReactNode }) {
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadQuranData() {
      try {
        // Dynamically import the JSON file
        const data = await import('@/lib/quran.json');
        // The default export of the JSON module is the data itself
        setQuranData(data as QuranData);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load Quran data'));
      } finally {
        setIsLoading(false);
      }
    }
    loadQuranData();
  }, []);

  const value = { quranData, isLoading, error };

  return (
    <QuranDataContext.Provider value={value}>
      {children}
    </QuranDataContext.Provider>
  );
}

export function useQuranData() {
  const context = useContext(QuranDataContext);
  if (context === undefined) {
    throw new Error('useQuranData must be used within a QuranDataProvider');
  }
  return context;
}
