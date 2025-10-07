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

// A map for Juz names in Arabic
export const juzArabicNames = new Map([
  [1, 'الم'],
  [2, 'سيقول السفهاء'],
  [3, 'تلك الرسل'],
  [4, 'لن تنالوا'],
  [5, 'والمحصنات'],
  [6, 'لا يحب الله'],
  [7, 'وإذا سمعوا'],
  [8, 'ولو أننا'],
  [9, 'قال الملأ'],
  [10, 'واعلموا'],
  [11, 'يعتذرون'],
  [12, 'وما من دابة'],
  [13, 'وما أبرئ'],
  [14, 'ربما'],
  [15, 'سبحان الذي'],
  [16, 'قال ألم'],
  [17, 'اقترب للناس'],
  [18, 'قد أفلح'],
  [19, 'وقال الذين'],
  [20, 'أمن خلق'],
  [21, 'اتل ما أوحي'],
  [22, 'ومن يقنت'],
  [23, 'وما لي'],
  [24, 'فمن أظلم'],
  [25, 'إليه يرد'],
  [26, 'حم'],
  [27, 'قال فما خطبكم'],
  [28, 'قد سمع الله'],
  [29, 'تبارك الذي'],
  [30, 'عمّ'],
]);

// All 120 quarter-juz identifiers and labels
export const juzPartStaticData = Array.from({ length: 30 }, (_, i) => i + 1).flatMap(juz => {
    const juzName = juzArabicNames.get(juz) || `Juz ${juz}`;
    return [
        { value: `${(juz - 1) * 4 + 1}`, label: `Juz ${juz} - Part 1`, juzName, half: "First Half" as const, part: 1 },
        { value: `${(juz - 1) * 4 + 2}`, label: `Juz ${juz} - Part 2`, juzName, half: "First Half" as const, part: 2 },
        { value: `${(juz - 1) * 4 + 3}`, label: `Juz ${juz} - Part 3`, juzName, half: "Second Half" as const, part: 3 },
        { value: `${(juz - 1) * 4 + 4}`, label: `Juz ${juz} - Part 4`, juzName, half: "Second Half" as const, part: 4 },
    ]
});


// A map for quick label lookup from a quarter-juz value
export const juzPartMap = new Map(juzPartStaticData.map(item => [item.value, item.label]));
