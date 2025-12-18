
"use client";

import { useState, useMemo } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  collection,
  query,
  where,
  doc,
  Timestamp,
} from "firebase/firestore";

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
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
import { CustomRevisionCalendar } from "@/components/hifz-tracker/custom-revision-calendar";
import { Login } from "@/components/hifz-tracker/login";
import type { Revision, RevisionLog } from "@/lib/types";

export default function Home() {
  const { user, firestore, isAuthReady, isUserLoading, isVerifyingRedirect } = useFirebase();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const revisionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "revisionLogs"),
      where("userId", "==", user.uid)
    );
  }, [user, firestore]);

  const { data: revisionLogs, isLoading: isLoadingRevisions } =
    useCollection<RevisionLog>(revisionsQuery);

  const revisions: Revision[] = useMemo(() => {
    if (!revisionLogs) return [];
    return revisionLogs
      .filter((log) => log.juzPart !== undefined && log.juzPart !== null) 
      .map((log) => {
        const revisionDate = log.revisionDate as Timestamp | null;
        return {
          ...log,
          date: revisionDate ? revisionDate.toDate() : new Date(),
          quality: log.qualityRating,
          comments: log.comments,
          juzPart: log.juzPart.toString(),
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [revisionLogs]);

  const addRevision = (newRevisionData: Omit<Revision, "id" | "userId">, juzPart: string) => {
    if (!user || !firestore) return;
    const revisionLogsCollection = collection(firestore, "revisionLogs");
    const newLog: Omit<RevisionLog, "id"> = {
      userId: user.uid,
      juzPart: parseInt(juzPart, 10),
      revisionDate: Timestamp.fromDate(newRevisionData.date),
      qualityRating: newRevisionData.quality,
      comments: newRevisionData.comments,
    };
    addDocumentNonBlocking(revisionLogsCollection, newLog);
    // Keep form open for multiple batches, close it manually
    // setIsFormOpen(false); 
  };

  const deleteRevision = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "revisionLogs", id);
    deleteDocumentNonBlocking(docRef);
  };

  // This is the primary loading gate for the entire application.
  // It waits for Firebase to be ready, for any redirect to be processed, and for user status to be confirmed.
  if (!isAuthReady || isUserLoading || isVerifyingRedirect) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading Hifz Tracker...</p>
      </div>
    );
  }

  // If Firebase is ready but there's no user, show the login page.
  if (!user) {
    return <Login />;
  }

  // If we have a user but are still waiting for their data, show a specific loading screen.
  if (isLoadingRevisions) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading your Hifz journey...</p>
      </div>
    );
  }

  // If auth is ready, we have a user, and their data is loaded, show the dashboard.
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
                <DialogTitle>Log New Revision(s)</DialogTitle>
                <DialogDescription>
                  Record your memorization or revision progress for one or more parts.
                </DialogDescription>
              </DialogHeader>
              <RevisionLogForm onSubmit={addRevision} />
            </DialogContent>
          </Dialog>
        </div>

        <JourneyOverview revisions={revisions} />
        <CustomRevisionCalendar revisions={revisions} />
        <RevisionHistoryTable revisions={revisions} onDelete={deleteRevision} />
      </main>
    </div>
  );
}
