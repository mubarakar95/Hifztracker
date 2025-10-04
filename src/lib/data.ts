import type { Revision } from './types';
import { halfJuzStaticData, RevisionQualities } from './types';
import { subDays } from 'date-fns';

const generateInitialRevisions = (): Revision[] => {
  const revisions: Revision[] = [];
  const today = new Date();
  const qualities: RevisionQuality[] = ["Excellent", "Good", "Needs Improvement"];

  halfJuzStaticData.forEach((halfJuz, index) => {
    // Spread revisions over the last 60 days
    const revisionDate = subDays(today, 60 - index -1);
    const quality = qualities[Math.floor(Math.random() * qualities.length)];

    let comments = '';
    switch (quality) {
      case 'Excellent':
        comments = 'Very smooth, no issues.';
        break;
      case 'Good':
        comments = 'A few hesitations, but overall solid.';
        break;
      case 'Needs Improvement':
        comments = 'Struggled with a few sections, needs more focus here.';
        break;
    }

    revisions.push({
      id: `${index + 1}`,
      halfJuz: halfJuz.value,
      date: revisionDate,
      quality: quality,
      comments: comments,
    });
  });

  // Add a few more recent revisions to make it more realistic
   revisions.push({
    id: '61',
    halfJuz: 'juz-1-1',
    date: subDays(today, 5),
    quality: 'Excellent',
    comments: 'Second revision. Much improved!',
  });
   revisions.push({
    id: '62',
    halfJuz: 'juz-1-2',
    date: subDays(today, 3),
    quality: 'Excellent',
    comments: 'Feeling very confident with this part.',
  });
   revisions.push({
    id: '63',
    halfJuz: 'juz-2-1',
    date: subDays(today, 1),
    quality: 'Good',
    comments: 'Reviewed again. Getting better.',
  });

  return revisions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const initialRevisions: Revision[] = generateInitialRevisions();
