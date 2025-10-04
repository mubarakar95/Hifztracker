
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Revision, RevisionQuality } from "@/lib/types";
import { halfJuzStaticData } from "@/lib/types";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

type JourneyOverviewProps = {
  revisions: Revision[];
};

const qualityColorMap: Record<RevisionQuality, string> = {
  Excellent: "bg-primary/80 border-primary",
  Good: "bg-accent/80 border-accent",
  "Needs Improvement": "bg-destructive/80 border-destructive",
};

export function JourneyOverview({ revisions }: JourneyOverviewProps) {
  const isMobile = useIsMobile();
  const [selectedJuz, setSelectedJuz] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const latestRevisionsMap = useMemo(() => {
    const map = new Map<string, Revision>();
    revisions.forEach((revision) => {
      const existing = map.get(revision.halfJuz);
      if (!existing || revision.date > existing.date) {
        map.set(revision.halfJuz, revision);
      }
    });
    return map;
  }, [revisions]);
  
  const selectedRevision = selectedJuz ? latestRevisionsMap.get(selectedJuz.value) : null;

  const renderJuzSquare = (value: string, label: string) => {
    const latestRevision = latestRevisionsMap.get(value);
    const juzNumber = label.match(/Juz (\d+)/)?.[1];

    return (
      <div
        className={cn(
          "h-10 w-10 sm:h-12 sm:w-12 rounded-md border flex items-center justify-center font-bold text-sm transition-colors",
          latestRevision
            ? qualityColorMap[latestRevision.quality]
            : "bg-muted/50 hover:bg-muted"
        )}
      >
        <span
          className={cn(
            latestRevision ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {juzNumber}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey Overview</CardTitle>
        <CardDescription>
          A visual summary of your revision progress.{" "}
          {isMobile
            ? "Tap a square for details."
            : "Hover over a square for details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <Dialog
            open={!!selectedJuz}
            onOpenChange={(isOpen) => !isOpen && setSelectedJuz(null)}
          >
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {halfJuzStaticData.map(({ value, label }) => (
                <DialogTrigger
                  key={value}
                  asChild
                  onClick={() => setSelectedJuz({ value, label })}
                >
                  {renderJuzSquare(value, label)}
                </DialogTrigger>
              ))}
            </div>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedJuz?.label}</DialogTitle>
                <DialogDescription>
                  {selectedRevision ? (
                    <span>
                      Last revised:{" "}
                      <strong>
                        {format(selectedRevision.date, "PPP")}
                      </strong>
                    </span>
                  ) : (
                    <span>Not yet revised.</span>
                  )}
                </DialogDescription>
                  {selectedRevision && (
                    <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                       <div>
                        Quality: <strong>{selectedRevision.quality}</strong>
                      </div>
                      {selectedRevision.comments && <div>Comments: {selectedRevision.comments}</div>}
                    </div>
                  )}
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {halfJuzStaticData.map(({ value, label }) => {
                const latestRevision = latestRevisionsMap.get(value);
                return (
                  <Tooltip key={value} delayDuration={0}>
                    <TooltipTrigger asChild>
                      {renderJuzSquare(value, label)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{label}</p>
                      {latestRevision ? (
                        <>
                          <p>
                            Last revised: {format(latestRevision.date, "PPP")}
                          </p>
                          <p>Quality: {latestRevision.quality}</p>
                        </>
                      ) : (
                        <p>Not yet revised</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
