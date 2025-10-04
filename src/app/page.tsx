"use client";

import { useMemo, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { useCollection, useFirebase } from "@/firebase";
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppHeader } from "@/components/hifz-tracker/header";
import { JourneyOverview } from "@/components/hifz-tracker/journey-overview";
import { RevisionHistoryTable } from "@/components/hifz-tracker/revision-history-table";
import { RevisionLogForm } from "@/components/hifz-tracker/revision-log-form";
import { RevisionCalendar } from "@/components/hifz-tracker/revision-calendar";
import { Login } from "@/components/hifz-tracker/login";
import type { Revision, RevisionLog } from "@/lib/types";

export default function Home() {
  const { user, isUserLoading, firestore } = useFirebase();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const revisionsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "users", user.uid, "revisionLogs");
  }, [user, firestore]);

  const { data: revisionLogs, isLoading: isLoadingRevisions } =
    useCollection<RevisionLog>(revisionsQuery);

  const revisions: Revision[] = useMemo(() => {
    if (!revisionLogs) return [];
    return revisionLogs
      .map((log) => ({
        ...log,
        date: (log.revisionDate as Timestamp).toDate(),
        quality: log.qualityRating,
        comments: log.comments,
        halfJuz: log.halfJuz.toString(),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [revisionLogs]);

  const addRevision = (newRevisionData: Omit<Revision, "id">) => {
    if (!revisionsQuery) return;
    const newLog: Omit<RevisionLog, "id" | "userId"> = {
      halfJuz: parseInt(newRevisionData.halfJuz, 10),
      revisionDate: serverTimestamp(),
      qualityRating: newRevisionData.quality,
      comments: newRevisionData.comments,
    };
    addDocumentNonBlocking(revisionsQuery, newLog);
    setIsFormOpen(false);
  };

  const deleteRevision = (id: string) => {
    if (!revisionsQuery) return;
    const docRef = doc(revisionsQuery, id);
    deleteDocumentNonBlocking(docRef);
  };

  if (isUserLoading || isLoadingRevisions) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading your Hifz journey...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader revisions={revisions} />
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 lg:p-12">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            My Hifz Journey
          </h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Log Revision
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log New Revision</DialogTitle>
                <DialogDescription>
                  Record your memorization or revision progress.
                </DialogDescription>
              </DialogHeader>
              <RevisionLogForm onSubmit={addRevision} />
            </DialogContent>
          </Dialog>
        </div>

        <JourneyOverview revisions={revisions} />
        <RevisionCalendar revisions={revisions} />
        <RevisionHistoryTable revisions={revisions} onDelete={deleteRevision} />
      </main>
    </div>
  );
}
