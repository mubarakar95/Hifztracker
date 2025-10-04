import type { Revision } from './types';

export const initialRevisions: Revision[] = [
  {
    id: '1',
    halfJuz: 'juz-30-2',
    date: new Date('2024-05-20'),
    quality: 'Excellent',
    comments: 'Surah An-Nas to Al-A\'la. Alhamdulillah, very smooth.',
  },
  {
    id: '2',
    halfJuz: 'juz-30-1',
    date: new Date('2024-05-22'),
    quality: 'Good',
    comments: 'Surah At-Tariq to An-Naba. Some hesitation in At-Takwir.',
  },
  {
    id: '3',
    halfJuz: 'juz-1-1',
    date: new Date('2024-05-25'),
    quality: 'Needs Improvement',
    comments: 'Al-Fatihah and first half of Al-Baqarah. Struggled with متشابهات (mutashabihat). Needs more focus.',
  },
   {
    id: '4',
    halfJuz: 'juz-30-2',
    date: new Date('2024-05-28'),
    quality: 'Excellent',
    comments: 'Revised again. Much better this time.',
  },
];
