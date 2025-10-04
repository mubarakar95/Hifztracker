import { BookOpen, Target } from "lucide-react";
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
  const allHalfJuz = halfJuzStaticData.map((j) => j.value);
  const revisedJuz = new Set(revisions.map((r) => r.halfJuz));

  const unrevisedJuz = allHalfJuz.find((j) => !revisedJuz.has(j));
  if (unrevisedJuz) {
    return halfJuzMap.get(unrevisedJuz) || "Start your journey!";
  }

  const latestRevisionsMap = new Map<string, Revision>();
  for (const revision of revisions) {
    if (!latestRevisionsMap.has(revision.halfJuz) || revision.date > latestRevisionsMap.get(revision.halfJuz)!.date) {
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
    const daysSinceRevision = differenceInDays(now, revision.date);

    // Simple scoring: quality has higher weight. Add days to break ties.
    const score = (qualityScore * 100) + daysSinceRevision;

    if (score > maxScore) {
      maxScore = score;
      nextJuzToRevise = halfJuz;
    }
  }

  return halfJuzMap.get(nextJuzToRevise) || "Complete all revisions!";
};


export function AppHeader({ revisions }: { revisions: Revision[] }) {
  const objective = useMemo(() => calculateObjective(revisions), [revisions]);

  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6 justify-between">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold">Hifz Tracker</h1>
      </div>
      <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Next Objective</span>
            <span className="font-semibold text-accent">{objective}</span>
          </div>
        </div>
    </header>
  );
}
