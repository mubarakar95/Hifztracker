export const RevisionQualities = ["Excellent", "Good", "Needs Improvement"] as const;
export type RevisionQuality = (typeof RevisionQualities)[number];

export type Revision = {
  id: string;
  halfJuz: string;
  date: Date;
  quality: RevisionQuality;
  comments: string;
};

// All 60 half-juz identifiers and labels
export const halfJuzStaticData = Array.from({ length: 30 }, (_, i) => i + 1).flatMap(juz => [
    { value: `juz-${juz}-1`, label: `Juz ${juz} - First Half` },
    { value: `juz-${juz}-2`, label: `Juz ${juz} - Second Half` },
]);

// A map for quick label lookup from a half-juz value
export const halfJuzMap = new Map(halfJuzStaticData.map(item => [item.value, item.label]));
