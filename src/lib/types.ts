import { Timestamp } from "firebase/firestore";

export const RevisionQualities = ["Excellent", "Good", "Needs Improvement"] as const;
export type RevisionQuality = (typeof RevisionQualities)[number];

export type Revision = {
  id: string;
  juzPart: string;
  date: Date;
  quality: RevisionQuality;
  comments?: string;
};

export type RevisionLog = {
    id: string;
    userId: string;
    juzPart: number;
    revisionDate: Timestamp;
    qualityRating: RevisionQuality;
    comments?: string;
}

// All 120 quarter-juz identifiers and labels
export const juzPartStaticData = Array.from({ length: 30 }, (_, i) => i + 1).flatMap(juz => [
    { value: `${(juz - 1) * 4 + 1}`, label: `Juz ${juz} - Part 1` },
    { value: `${(juz - 1) * 4 + 2}`, label: `Juz ${juz} - Part 2` },
    { value: `${(juz - 1) * 4 + 3}`, label: `Juz ${juz} - Part 3` },
    { value: `${(juz - 1) * 4 + 4}`, label: `Juz ${juz} - Part 4` },
]);

// A map for quick label lookup from a quarter-juz value
export const juzPartMap = new Map(juzPartStaticData.map(item => [item.value, item.label]));