
"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import type { Revision } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { JuzCircle } from "./juz-circle";

type JourneyOverviewProps = {
  revisions: Revision[];
};

const timeFrameOptions = [
  { value: "7", label: "Last 7 Days" },
  { value: "14", label: "Last 14 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "60", label: "Last 60 Days" },
  { value: "all", label: "All Time" },
];

export function JourneyOverview({ revisions }: JourneyOverviewProps) {
  const isMobile = useIsMobile();
  const [selectedPart, setSelectedPart] = useState<{
    juz: number;
    part: number;
    label: string;
  } | null>(null);
  const [timeFrame, setTimeFrame] = useState<string>("30");

  const filteredRevisions = useMemo(() => {
    if (timeFrame === "all") {
      return revisions;
    }
    const days = parseInt(timeFrame, 10);
    const cutOffDate = subDays(new Date(), days);
    return revisions.filter((r) => r.date >= cutOffDate);
  }, [revisions, timeFrame]);

  const revisionsByJuzPart = useMemo(() => {
    const map = new Map<string, Revision>();
    filteredRevisions.forEach((revision) => {
      const existing = map.get(revision.juzPart);
      if (!existing || revision.date > existing.date) {
        map.set(revision.juzPart, revision);
      }
    });
    return map;
  }, [filteredRevisions]);

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Journey Overview</CardTitle>
            <CardDescription className="mt-1.5">
              A visual summary of your revision progress. Each circle is a Juz,
              and each quadrant is 5 pages.{" "}
              {isMobile
                ? "Tap a quadrant for details."
                : "Hover over a quadrant for details."}
            </CardDescription>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                {timeFrameOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Dialog
            open={isMobile && !!selectedPart}
            onOpenChange={(isOpen) => !isOpen && setSelectedPart(null)}
          >
            <div className="grid grid-cols-5 gap-2 sm:gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
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
                      Last revised on:{" "}
                      <strong>
                        {format(selectedRevision.date, "PPP")}
                      </strong>
                    </DialogDescription>
                  ) : (
                     <DialogDescription>Not yet revised in this period.</DialogDescription>
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
