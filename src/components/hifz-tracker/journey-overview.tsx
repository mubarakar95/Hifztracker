
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Revision, RevisionQuality } from "@/lib/types";
import { juzPartStaticData } from "@/lib/types";
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
      const existing = map.get(revision.juzPart);
      if (!existing || revision.date > existing.date) {
        map.set(revision.juzPart, revision);
      }
    });
    return map;
  }, [revisions]);

  const selectedRevision = selectedJuz ? latestRevisionsMap.get(selectedJuz.value) : null;

  const renderJuzSquare = (value: string, label: string) => {
    const latestRevision = latestRevisionsMap.get(value);
    const partNumber = parseInt(value, 10);
    const isFirstInJuz = (partNumber - 1) % 4 === 0;

    return (
      <div
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 rounded-sm border flex items-center justify-center font-bold text-xs transition-colors",
          latestRevision
            ? qualityColorMap[latestRevision.quality]
            : "bg-muted/50 hover:bg-muted",
          isFirstInJuz && "ml-2"
        )}
      >
        <span
          className={cn(
            "text-xs",
            latestRevision ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {partNumber}
        </span>
      </div>
    );
  };
  
  const juzGroups = Array.from({ length: 30 }, (_, i) => {
    const juzNumber = i + 1;
    const parts = juzPartStaticData.filter(part => part.label.startsWith(`Juz ${juzNumber}`));
    return { juzNumber, parts };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey Overview</CardTitle>
        <CardDescription>
          A visual summary of your revision progress. Each group is a Juz, each square is 5 pages.{" "}
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
            <div className="flex flex-wrap gap-2">
              {juzPartStaticData.map(({ value, label }) => (
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
                    {selectedRevision.comments && <div>Comments: {selectedRevision.comments}</div>}
                  </div>
                )}
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ) : (
          <TooltipProvider>
            <div className="flex flex-wrap gap-y-2">
                {juzGroups.map(({juzNumber, parts}) => (
                    <div key={juzNumber} className="flex items-center">
                        <div className="w-8 text-right mr-2 font-medium text-muted-foreground text-sm">{juzNumber}</div>
                        <div className="flex gap-1">
                            {parts.map(({ value, label }) => {
                                const latestRevision = latestRevisionsMap.get(value);
                                return (
                                <Tooltip key={value} delayDuration={0}>
                                    <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "h-8 w-8 sm:h-9 sm:w-9 rounded-sm border flex items-center justify-center font-bold text-xs transition-colors",
                                            latestRevision
                                            ? qualityColorMap[latestRevision.quality]
                                            : "bg-muted/50 hover:bg-muted"
                                        )}
                                        >
                                    </div>
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
                    </div>
                ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
