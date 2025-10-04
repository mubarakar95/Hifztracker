import { cn } from "@/lib/utils";
import type { RevisionQuality } from "@/lib/types";

type QualityBadgeProps = {
  quality: RevisionQuality;
};

export function QualityBadge({ quality }: QualityBadgeProps) {
  const qualityColorMap: Record<RevisionQuality, string> = {
    "Excellent": "bg-primary",
    "Good": "bg-accent",
    "Needs Improvement": "bg-destructive",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", qualityColorMap[quality])}
        aria-hidden="true"
      />
      <span className="text-sm">{quality}</span>
    </div>
  );
}
