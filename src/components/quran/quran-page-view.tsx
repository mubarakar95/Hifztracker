
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import type { QuranData, Ayah, Surah } from '@/lib/quran-types';

interface QuranPageViewProps {
  pageNumber: number;
  quranData: QuranData | null;
}

interface PageContent {
  surahNumber: number;
  surahName: string;
  isNewSurah: boolean;
  ayahs: Ayah[];
}

export function QuranPageView({ pageNumber, quranData }: QuranPageViewProps) {
  const pageContent = useMemo(() => {
    if (!quranData) return [];

    const ayahsOnPage = quranData.surahs.flatMap((surah) =>
      surah.ayahs.filter((ayah) => ayah.page === pageNumber)
    );

    if (ayahsOnPage.length === 0) return [];

    // Group ayahs by surah
    const groupedBySurah = ayahsOnPage.reduce((acc, ayah) => {
      const surah = quranData.surahs.find((s) => s.number === ayah.juz); // This seems incorrect in data, using juz as surah
      const surahInfo = quranData.surahs.find(s => s.ayahs.some(a => a.number === ayah.number));

      if (surahInfo) {
        if (!acc[surahInfo.number]) {
          acc[surahInfo.number] = {
            surahNumber: surahInfo.number,
            surahName: surahInfo.name,
            englishName: surahInfo.englishName,
            ayahs: [],
            isNewSurah: false,
          };
        }
        acc[surahInfo.number].ayahs.push(ayah);
      }
      return acc;
    }, {} as Record<number, { surahNumber: number, surahName: string, englishName: string, ayahs: Ayah[], isNewSurah: boolean }>);

    // Check if it's a new surah on this page
    Object.values(groupedBySurah).forEach(group => {
        const firstAyahOnPage = group.ayahs[0];
        if (firstAyahOnPage.numberInSurah === 1 && firstAyahOnPage.number !== 9) { // Exclude Surah At-Tawbah
            group.isNewSurah = true;
        }
    });

    return Object.values(groupedBySurah);
  }, [pageNumber, quranData]);

  return (
    <Card className="h-full flex flex-col font-arabic shadow-lg border-2 border-primary/20">
      <CardHeader>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Juz {pageContent[0]?.ayahs[0]?.juz || ''}</span>
          <span>{pageContent[0]?.surahName || ''}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 md:p-6 text-2xl leading-loose text-right">
        {pageContent.map((group, index) => (
          <div key={group.surahNumber}>
            {group.isNewSurah && (
              <div className="flex flex-col items-center my-4">
                <p className="text-xl font-bold border-y-2 border-primary py-2 px-8">
                  {group.surahName}
                </p>
                { group.surahNumber !== 1 && <p className='text-lg mt-4'>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p> }
              </div>
            )}
            <p>
              {group.ayahs.map((ayah) => (
                <span key={ayah.number}>
                  {ayah.text}
                  <span className="text-sm text-primary mx-1">
                    ({ayah.numberInSurah})
                  </span>
                </span>
              ))}
            </p>
          </div>
        ))}
        {pageContent.length === 0 && (
           <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-lg">Page content not available.</p>
           </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          - {pageNumber} -
        </div>
      </CardFooter>
    </Card>
  );
}
