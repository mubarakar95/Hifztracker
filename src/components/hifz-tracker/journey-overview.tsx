
"use client";

import { useMemo, useState } from "react";
import { format, subDays, differenceInDays } from "date-fns";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
  const [timeFrame, setTimeFrame] = useState<string>("all");
  const [rotationDays, setRotationDays] = useState<number>(15);

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
    // Since sorted by date desc in parent, the first occurrence is the latest
    filteredRevisions.forEach((revision) => {
      if (!map.has(revision.juzPart)) {
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <CardTitle>Journey Freshness</CardTitle>
            <CardDescription className="mt-1.5">
              Colors represent how recently a part was revised based on your cycle.
              <span className="block mt-2 font-medium text-foreground">
                Green: Fresh | Yellow: Due Soon | Red: Overdue
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-4 sm:w-[250px]">
             <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="rotation-slider" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Revision Cycle: {rotationDays} Days
                </Label>
              </div>
              <Slider
                id="rotation-slider"
                min={1}
                max={60}
                step={1}
                value={[rotationDays]}
                onValueChange={(val) => setRotationDays(val[0])}
                className="py-1"
              />
            </div>
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Show revisions from..." />
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
                  rotationDays={rotationDays}
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
                      <br />
                      ({differenceInDays(new Date(), selectedRevision.date)} days ago)
                    </DialogDescription>
                  ) : (
                     <DialogDescription>Not yet revised in this period.</DialogDescription>
                  )}
                  {selectedRevision && (
                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
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
