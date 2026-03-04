"use client";

import { useMemo, useState, useEffect } from "react";
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
  
  const [now, setNow] = useState<Date | null>(null);
  const [timeFrame, setTimeFrame] = useState<string>("all");
  const [rotationDays, setRotationDays] = useState<number>(15);

  useEffect(() => {
    setNow(new Date());
    // Load persisted settings
    const savedRotation = localStorage.getItem("hifz_rotation_days");
    const savedTimeFrame = localStorage.getItem("hifz_time_frame");
    
    if (savedRotation) setRotationDays(parseInt(savedRotation, 10));
    if (savedTimeFrame) setTimeFrame(savedTimeFrame);
  }, []);

  const handleRotationChange = (val: number[]) => {
    const newDays = val[0];
    setRotationDays(newDays);
    localStorage.setItem("hifz_rotation_days", newDays.toString());
  };

  const handleTimeFrameChange = (val: string) => {
    setTimeFrame(val);
    localStorage.setItem("hifz_time_frame", val);
  };

  const filteredRevisions = useMemo(() => {
    if (!now) return [];
    if (timeFrame === "all") {
      return revisions;
    }
    const days = parseInt(timeFrame, 10);
    const cutOffDate = subDays(now, days);
    return revisions.filter((r) => r.date >= cutOffDate);
  }, [revisions, timeFrame, now]);

  const revisionsByJuzPart = useMemo(() => {
    const map = new Map<string, Revision>();
    filteredRevisions.forEach((revision) => {
      // Keep only the most recent revision for freshness logic
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

  const freshnessGradient = useMemo(() => {
    if (!now) return "none";
    const stops: string[] = [];
    const totalParts = 120;

    for (let i = 1; i <= totalParts; i++) {
      const revision = revisionsByJuzPart.get(i.toString());
      let color = "hsl(var(--muted))";

      if (revision) {
        const daysSince = differenceInDays(now, revision.date);
        if (daysSince <= rotationDays * 0.33) {
          color = "hsl(var(--primary))"; // Green
        } else if (daysSince <= rotationDays) {
          color = "hsl(var(--accent))"; // Yellow
        } else {
          color = "hsl(var(--destructive))"; // Red
        }
      }
      
      const percentage = (i / totalParts) * 100;
      stops.push(`${color} ${percentage}%`);
    }

    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [revisionsByJuzPart, rotationDays, now]);

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
                onValueChange={handleRotationChange}
                className="py-1"
              />
            </div>
            <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
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
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-2">
            <span>Juz 1</span>
            <span>Juz 15</span>
            <span>Juz 30</span>
          </div>
          <div 
            className="h-6 w-full rounded-full border shadow-inner transition-all duration-500 ease-in-out"
            style={{ background: freshnessGradient }}
          />
          <div className="flex justify-center">
            <span className="text-[10px] text-muted-foreground italic uppercase tracking-widest">Linear Freshness Timeline</span>
          </div>
        </div>

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
                  {selectedRevision && now ? (
                    <DialogDescription>
                      Last revised on:{" "}
                      <strong>
                        {format(selectedRevision.date, "PPP")}
                      </strong>
                      <br />
                      ({differenceInDays(now, selectedRevision.date)} days ago)
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
