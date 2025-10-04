import { BookOpen, Target, Repeat } from "lucide-react";
import type { Revision } from "@/lib/types";
import { halfJuzStaticData, halfJuzMap } from "@/lib/types";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";

const qualityScoreMap: Record<Revision['quality'], number> = {
  "Needs Improvement": 3,
  "Good": 2,
  "Excellent": 1,
};

const calculateObjective = (revisions: Revision[]): string => {
  if (revisions.length === 0) return "Start your journey!";

  const allHalfJuz = halfJuzStaticData.map((j) => j.value);
  const revisedJuz = new Set(revisions.map((r) => r.halfJuz));

  const unrevisedJuz = allHalfJuz.find((j) => !revisedJuz.has(j));
  if (unrevisedJuz) {
    return halfJuzMap.get(unrevisedJuz) || "Start your journey!";
  }

  const latestRevisionsMap = new Map<string, Revision>();
  for (const revision of revisions) {
    if (!latestRevisionsMap.has(revision.halfJuz) || new Date(revision.date) > new Date(latestRevisionsMap.get(revision.halfJuz)!.date)) {
      latestRevisionsMap.set(revision.halfJuz, revision);
    }
  }

  let nextJuzToRevise = '';
  let maxScore = -1;
  const now = new Date();

  for (const halfJuz of allHalfJuz) {
    const revision = latestRevisionsMap.get(halfJuz);
    if (!revision) continue; 

    const qualityScore = qualityScoreMap[revision.quality];
    const daysSinceRevision = differenceInDays(now, new Date(revision.date));

    const score = (qualityScore * 100) + daysSinceRevision;

    if (score > maxScore) {
      maxScore = score;
      nextJuzToRevise = halfJuz;
    }
  }

  return halfJuzMap.get(nextJuzToRevise) || "Complete all revisions!";
};

const calculateDawra = (revisions: Revision[]): number => {
  if (revisions.length === 0) return 0;

  const revisionCounts = new Map<string, number>();
  for (const revision of revisions) {
    revisionCounts.set(revision.halfJuz, (revisionCounts.get(revision.halfJuz) || 0) + 1);
  }

  if (revisionCounts.size < halfJuzStaticData.length) {
    return 0;
  }

  let minRevisions = Infinity;
  for (const halfJuz of halfJuzStaticData) {
    const count = revisionCounts.get(halfJuz.value) || 0;
    if (count < minRevisions) {
      minRevisions = count;
    }
  }

  return minRevisions;
};

export function AppHeader({ revisions }: { revisions: Revision[] }) {
  const objective = useMemo(() => calculateObjective(revisions), [revisions]);
  const dawra = useMemo(() => calculateDawra(revisions), [revisions]);

  return (
    <header className="flex h-auto min-h-16 items-center border-b bg-card px-4 py-2 md:px-6 md:h-16 justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold">Hifz Tracker</h1>
      </div>
      <div className="flex w-full md:w-auto items-center justify-around gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <Repeat className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Dawra</span>
            <span className="font-semibold text-primary">{dawra}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Next Objective</span>
            <span className="font-semibold text-accent truncate max-w-[150px] sm:max-w-none">{objective}</span>
          </div>
        </div>
      </div>
    </header>
  );
}