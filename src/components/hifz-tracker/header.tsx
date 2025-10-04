"use client";

import { BookOpen, Target, Repeat, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import type { Revision } from "@/lib/types";
import { halfJuzStaticData, halfJuzMap } from "@/lib/types";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";
import { useFirebase } from "@/firebase";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card } from "../ui/card";

const qualityScoreMap: Record<Revision["quality"], number> = {
  "Needs Improvement": 3,
  Good: 2,
  Excellent: 1,
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
    if (
      !latestRevisionsMap.has(revision.halfJuz) ||
      new Date(revision.date) >
        new Date(latestRevisionsMap.get(revision.halfJuz)!.date)
    ) {
      latestRevisionsMap.set(revision.halfJuz, revision);
    }
  }

  let nextJuzToRevise = "";
  let maxScore = -1;
  const now = new Date();

  for (const halfJuz of allHalfJuz) {
    const revision = latestRevisionsMap.get(halfJuz);
    if (!revision) continue;

    const qualityScore = qualityScoreMap[revision.quality];
    const daysSinceRevision = differenceInDays(now, new Date(revision.date));

    const score = qualityScore * 100 + daysSinceRevision;

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
    revisionCounts.set(
      revision.halfJuz,
      (revisionCounts.get(revision.halfJuz) || 0) + 1
    );
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
  const { auth, user } = useFirebase();
  const objective = useMemo(() => calculateObjective(revisions), [revisions]);
  const dawra = useMemo(() => calculateDawra(revisions), [revisions]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <header className="flex flex-col border-b bg-card">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-xl font-semibold">Hifz Tracker</h1>
        </div>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photoURL || ""}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback>
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-2 gap-px border-t bg-border md:hidden">
        <Card className="flex flex-col items-center justify-center gap-1 rounded-none border-0 p-4">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Dawra
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">{dawra}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 rounded-none border-0 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Objective
            </span>
          </div>
          <span className="truncate text-center text-lg font-semibold text-accent">
            {objective}
          </span>
        </Card>
      </div>

      <div className="hidden h-16 items-center justify-end gap-6 border-t px-6 md:flex">
         <div className="flex items-center gap-3">
          <Repeat className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Dawra
            </span>
            <span className="font-semibold text-primary">{dawra}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Next Objective
            </span>
            <span className="font-semibold text-accent truncate max-w-[200px]">
              {objective}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
