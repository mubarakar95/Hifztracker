import { Timestamp } from "firebase/firestore";

export const RevisionQualities = ["Excellent", "Good", "Needs Improvement"] as const;
export type RevisionQuality = (typeof RevisionQualities)[number];

export type Revision = {
  id: string;
  halfJuz: string;
  date: Date;
  quality: RevisionQuality;
  comments?: string;
};

export type RevisionLog = {
    id: string;
    userId: string;
    halfJuz: number;
    revisionDate: Timestamp;
    qualityRating: RevisionQuality;
    comments?: string;
}

// All 60 half-juz identifiers and labels
export const halfJuzStaticData = Array.from({ length: 30 }, (_, i) => i + 1).flatMap(juz => [
    { value: `${(juz - 1) * 2 + 1}`, label: `Juz ${juz} - First Half` },
    { value: `${(juz - 1) * 2 + 2}`, label: `Juz ${juz} - Second Half` },
]);

// A map for quick label lookup from a half-juz value
export const halfJuzMap = new Map(halfJuzStaticData.map(item => [item.value, item.label]));
