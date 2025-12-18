
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { QuranHeader } from '@/components/quran/header';
import { Button } from '@/components/ui/button';
import {
  QuranDataProvider,
  useQuranData,
} from '@/components/quran/quran-data-provider';
import { QuranPageView } from '@/components/quran/quran-page-view';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { surahToPageMap } from '@/lib/quran';

const TOTAL_PAGES = 604;

function QuranReader() {
  const [currentPage, setCurrentPage] = useState(1);
  const { quranData, isLoading, error } = useQuranData();

  const handleSurahChange = (surahNumber: string) => {
    const page = surahToPageMap[parseInt(surahNumber, 10)];
    if (page) {
      setCurrentPage(page);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 2, TOTAL_PAGES));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 2, 1));
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-destructive">
        <p>Error loading Quran data: {error.message}</p>
      </div>
    );
  }
  
  const rightPage = currentPage % 2 !== 0 ? currentPage : currentPage + 1;
  const leftPage = rightPage - 1;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex-1 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Right Page (shows first on smaller screens) */}
        <div className="order-1 lg:order-2">
            <QuranPageView pageNumber={rightPage} quranData={quranData} />
        </div>
        {/* Left Page (hidden on smaller screens, shown on lg) */}
        <div className="order-2 mt-8 lg:order-1 lg:mt-0">
          {leftPage > 0 && (
            <QuranPageView pageNumber={leftPage} quranData={quranData} />
          )}
        </div>
      </div>
      <footer className="mt-4 flex items-center justify-center gap-4 border-t pt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="w-full max-w-xs">
          <Select onValueChange={handleSurahChange}>
            <SelectTrigger>
              <SelectValue placeholder="Go to Surah..." />
            </SelectTrigger>
            <SelectContent>
              {quranData?.surahs.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.englishName} ({surah.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage + 1 >= TOTAL_PAGES}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}

export default function QuranPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <QuranHeader />
      <main className="flex flex-1">
        <QuranDataProvider>
          <QuranReader />
        </QuranDataProvider>
      </main>
    </div>
  );
}
