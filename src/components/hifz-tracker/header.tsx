"use client";

import { BookOpen, Target, Repeat, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import type { Revision } from "@/lib/types";
import { juzPartStaticData, juzPartMap } from "@/lib/types";
import { useMemo } from "react";
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

const calculateObjective = (revisions: Revision[]): string => {
  if (revisions.length === 0) return "Start your journey!";

  const allJuzParts = juzPartStaticData.map((j) => j.value);
  const revisedParts = new Set(revisions.map((r) => r.juzPart));

  // Find first part that has never been revised
  const unrevisedPart = allJuzParts.find((j) => !revisedParts.has(j));
  if (unrevisedPart) {
    return juzPartMap.get(unrevisedPart) || "Start your journey!";
  }

  // All parts revised at least once, find the one revised longest ago
  const latestRevisionsMap = new Map<string, Revision>();
  for (const revision of revisions) {
    if (
      !latestRevisionsMap.has(revision.juzPart) ||
      new Date(revision.date) >
        new Date(latestRevisionsMap.get(revision.juzPart)!.date)
    ) {
      latestRevisionsMap.set(revision.juzPart, revision);
    }
  }

  let nextJuzToRevise = "";
  let latestDate = new Date(0);

  for (const juzPart of allJuzParts) {
    const revision = latestRevisionsMap.get(juzPart);
    if (!revision) continue;

    if (new Date(revision.date) < latestDate || latestDate.getTime() === 0) {
      latestDate = new Date(revision.date);
      nextJuzToRevise = juzPart;
    }
  }

  return juzPartMap.get(nextJuzToRevise) || "Complete all revisions!";
};

const calculateDawra = (revisions: Revision[]): number => {
  if (revisions.length === 0) return 0;

  const revisionCounts = new Map<string, number>();
  for (const revision of revisions) {
    revisionCounts.set(
      revision.juzPart,
      (revisionCounts.get(revision.juzPart) || 0) + 1
    );
  }

  // If even one part is missing, Dawra is 0
  if (revisionCounts.size < juzPartStaticData.length) {
    return 0;
  }

  let minRevisions = Infinity;
  for (const juzPart of juzPartStaticData) {
    const count = revisionCounts.get(juzPart.value) || 0;
    if (count < minRevisions) {
      minRevisions = count;
    }
  }

  return minRevisions === Infinity ? 0 : minRevisions;
};

export function AppHeader({ revisions }: { revisions: Revision[] }) {
  const { auth, user } = useFirebase();
  const objective = useMemo(() => calculateObjective(revisions), [revisions]);
  const dawra = useMemo(() => calculateDawra(revisions), [revisions]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Errors are handled by FirebaseErrorListener
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-xl font-semibold">Hifz Tracker</h1>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-semibold border-b-2 border-primary">
              Dashboard
            </Link>
          </nav>
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
        <Card className="flex flex-col items-center justify-center gap-1 rounded-none border-0 p-4 shadow-none">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Dawra
            </span>
          </div>
          <span className="text-2xl font-bold text-primary">{dawra}</span>
        </Card>
        <Card className="flex flex-col items-center justify-center gap-1 rounded-none border-0 p-4 shadow-none">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">
              Next Goal
            </span>
          </div>
          <span className="truncate text-center text-lg font-semibold text-accent max-w-full px-2">
            {objective}
          </span>
        </Card>
      </div>

      <div className="hidden h-16 items-center justify-end gap-6 border-t px-6 md:flex">
         <div className="flex items-center gap-3">
          <Repeat className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Total Dawras
            </span>
            <span className="font-semibold text-primary">{dawra}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">
              Suggested Next Revision
            </span>
            <span className="font-semibold text-accent truncate max-w-[250px]">
              {objective}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
