"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";

import type { Revision } from "@/lib/types";
import { initialRevisions } from "@/lib/data";
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

export default function Home() {
  const [revisions, setRevisions] = useState<Revision[]>(initialRevisions);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const addRevision = (newRevisionData: Omit<Revision, "id">) => {
    const newRevision: Revision = {
      ...newRevisionData,
      id: crypto.randomUUID(),
    };
    setRevisions((prev) => [newRevision, ...prev]);
    setIsFormOpen(false);
  };

  const deleteRevision = (id: string) => {
    setRevisions((prev) => prev.filter((r) => r.id !== id));
  };

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
