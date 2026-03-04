"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { juzArabicNames, type Revision } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DialogTrigger } from "@/components/ui/dialog";

const defaultColor = "hsl(var(--muted))";

type QuadrantProps = {
  juz: number;
  part: number;
  label: string;
  revision: Revision | undefined;
  onPartClick: (juz: number, part: number, label: string) => void;
  isMobile: boolean;
  rotationDays: number;
  now: Date | null;
};

const Quadrant = ({
  juz,
  part,
  label,
  revision,
  onPartClick,
  isMobile,
  rotationDays,
  now,
}: QuadrantProps) => {
  const pathData = [
    "M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z", // Top-right
    "M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z", // Bottom-right
    "M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z", // Bottom-left
    "M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z", // Top-left
  ][part - 1];

  let color = defaultColor;
  let freshnessStatus = "Not yet revised";

  if (revision && now) {
    const daysSince = differenceInDays(now, revision.date);
    
    // Freshness logic based on user's rotation cycle
    if (daysSince <= rotationDays * 0.33) {
      color = "hsl(var(--primary))"; // Green
      freshnessStatus = "Fresh";
    } else if (daysSince <= rotationDays) {
      color = "hsl(var(--accent))"; // Yellow/Accent
      freshnessStatus = "Due Soon";
    } else {
      color = "hsl(var(--destructive))"; // Red
      freshnessStatus = "Overdue";
    }
  }

  const quadrantElement = (
    <path
      d={pathData}
      fill={color}
      className={cn(
        "cursor-pointer transition-opacity",
        !isMobile && "hover:opacity-80"
      )}
      onClick={() => onPartClick(juz, part, label)}
    />
  );

  if (isMobile) {
    return <DialogTrigger asChild>{quadrantElement}</DialogTrigger>;
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{quadrantElement}</TooltipTrigger>
      <TooltipContent>
        <p className="font-bold">{label}</p>
        <p className="text-xs font-semibold uppercase">{freshnessStatus}</p>
        {revision && now ? (
          <>
            <p>Last revised: {format(revision.date, "PPP")}</p>
            <p>({differenceInDays(now, revision.date)} days ago)</p>
          </>
        ) : (
          <p>Not yet revised</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

type JuzCircleProps = {
  juzNumber: number;
  revisionsByJuzPart: Map<string, Revision>;
  onPartClick: (juz: number, part: number, label: string) => void;
  isMobile: boolean;
  rotationDays: number;
};

export const JuzCircle = ({
  juzNumber,
  revisionsByJuzPart,
  onPartClick,
  isMobile,
  rotationDays,
}: JuzCircleProps) => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 100 100"
        className="w-12 h-12 md:h-16 md:w-16 transform-gpu transition-transform hover:scale-110"
      >
        {Array.from({ length: 4 }, (_, i) => i + 1).map((part) => {
          const juzPartValue = (juzNumber - 1) * 4 + part;
          const revision = revisionsByJuzPart.get(juzPartValue.toString());
          const label = `Juz ${juzNumber} - Part ${part}`;
          return (
            <Quadrant
              key={part}
              juz={juzNumber}
              part={part}
              label={label}
              revision={revision}
              onPartClick={onPartClick}
              isMobile={isMobile}
              rotationDays={rotationDays}
              now={now}
            />
          );
        })}
      </svg>
      <div className="mt-1 text-center w-16">
        <span className="text-xs font-medium text-muted-foreground">
          Juz {juzNumber}
        </span>
        <span className="block text-[10px] text-muted-foreground overflow-hidden whitespace-nowrap">
            {juzArabicNames.get(juzNumber)}
        </span>
      </div>
    </div>
  );
};
