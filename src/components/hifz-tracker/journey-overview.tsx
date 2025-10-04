
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Revision, RevisionQuality } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { JuzCircle } from "./juz-circle";

type JourneyOverviewProps = {
  revisions: Revision[];
};

export function JourneyOverview({ revisions }: JourneyOverviewProps) {
  const isMobile = useIsMobile();
  const [selectedPart, setSelectedPart] = useState<{
    juz: number;
    part: number;
    label: string;
  } | null>(null);

  const revisionsByJuzPart = useMemo(() => {
    const map = new Map<string, Revision>();
    revisions.forEach((revision) => {
      const existing = map.get(revision.juzPart);
      if (!existing || revision.date > existing.date) {
        map.set(revision.juzPart, revision);
      }
    });
    return map;
  }, [revisions]);

  const selectedRevision = useMemo(() => {
    if (!selectedPart) return null;
    const juzPartValue = (selectedPart.juz - 1) * 4 + selectedPart.part;
    return revisionsByJuzPart.get(juzPartValue.toString());
  }, [selectedPart, revisionsByJuzPart]);

  const handlePartClick = (juz: number, part: number, label: string) => {
    if (isMobile) {
      setSelectedPart({ juz, part, label });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey Overview</CardTitle>
        <CardDescription>
          A visual summary of your revision progress. Each circle is a Juz, and
          each quadrant is 5 pages.{" "}
          {isMobile
            ? "Tap a quadrant for details."
            : "Hover over a quadrant for details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Dialog
            open={isMobile && !!selectedPart}
            onOpenChange={(isOpen) => !isOpen && setSelectedPart(null)}
          >
            <div className="grid grid-cols-5 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
                <JuzCircle
                  key={juzNumber}
                  juzNumber={juzNumber}
                  revisionsByJuzPart={revisionsByJuzPart}
                  onPartClick={handlePartClick}
                  isMobile={isMobile}
                />
              ))}
            </div>
            {isMobile && selectedPart && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedPart.label}</DialogTitle>
                  {selectedRevision ? (
                    <DialogDescription>
                      Last revised:{" "}
                      <strong>
                        {format(selectedRevision.date, "PPP")}
                      </strong>
                    </DialogDescription>
                  ) : (
                    <DialogDescription>Not yet revised.</DialogDescription>
                  )}
                  {selectedRevision && (
                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                      <div>
                        Quality: <strong>{selectedRevision.quality}</strong>
                      </div>
                      {selectedRevision.comments && (
                        <div>Comments: {selectedRevision.comments}</div>
                      )}
                    </div>
                  )}
                </DialogHeader>
              </DialogContent>
            )}
          </Dialog>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
