
"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { juzArabicNames, type Revision, type RevisionQuality } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DialogTrigger } from "@/components/ui/dialog";

const qualityColorMap: Record<RevisionQuality, string> = {
  Excellent: "hsl(var(--primary))",
  Good: "hsl(var(--accent))",
  "Needs Improvement": "hsl(var(--destructive))",
};
const defaultColor = "hsl(var(--muted))";

type QuadrantProps = {
  juz: number;
  part: number;
  label: string;
  revision: Revision | undefined;
  onPartClick: (juz: number, part: number, label: string) => void;
  isMobile: boolean;
};

const Quadrant = ({
  juz,
  part,
  label,
  revision,
  onPartClick,
  isMobile,
}: QuadrantProps) => {
  const pathData = [
    "M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z", // Top-right
    "M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z", // Bottom-right
    "M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z", // Bottom-left
    "M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z", // Top-left
  ][part - 1];

  const color = revision ? qualityColorMap[revision.quality] : defaultColor;

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
        {revision ? (
          <>
            <p>Last revised: {format(revision.date, "PPP")}</p>
            <p>Quality: {revision.quality}</p>
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
};

export const JuzCircle = ({
  juzNumber,
  revisionsByJuzPart,
  onPartClick,
  isMobile,
}: JuzCircleProps) => {
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
            />
          );
        })}
      </svg>
      <div className="mt-1 text-center w-16">
        <span className="text-xs font-medium text-muted-foreground">
          Juz {juzNumber}
        </span>
        <span className="block text-[10px] text-muted-foreground truncate">
            {juzArabicNames.get(juzNumber)}
        </span>
      </div>
    </div>
  );
};
