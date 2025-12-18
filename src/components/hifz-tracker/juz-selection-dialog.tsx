
"use client";

import { juzArabicNames } from "@/lib/types";
import { cn } from "@/lib/utils";

type SelectableQuadrantProps = {
  juz: number;
  part: number;
  isSelected: boolean;
  onSelect: (juzPartValue: string) => void;
};

const SelectableQuadrant = ({
  juz,
  part,
  isSelected,
  onSelect,
}: SelectableQuadrantProps) => {
  const pathData = [
    "M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z", // Top-right
    "M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z", // Bottom-right
    "M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z", // Bottom-left
    "M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z", // Top-left
  ][part - 1];

  const color = isSelected ? "hsl(var(--primary))" : "hsl(var(--muted))";
  const juzPartValue = (juz - 1) * 4 + part;

  return (
    <path
      d={pathData}
      fill={color}
      className={cn(
        "cursor-pointer transition-opacity hover:opacity-80",
        isSelected && "stroke-background stroke-2"
      )}
      onClick={() => onSelect(juzPartValue.toString())}
    />
  );
};

type SelectableJuzCircleProps = {
  juzNumber: number;
  selectedParts: string[];
  onSelect: (juzPartValue: string) => void;
};

const SelectableJuzCircle = ({
  juzNumber,
  selectedParts,
  onSelect,
}: SelectableJuzCircleProps) => {
  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 100 100"
        className="h-16 w-16 transform-gpu transition-transform hover:scale-110"
      >
        {Array.from({ length: 4 }, (_, i) => i + 1).map((part) => {
          const juzPartValue = (juzNumber - 1) * 4 + part;
          const isSelected = selectedParts.includes(juzPartValue.toString());
          return (
            <SelectableQuadrant
              key={part}
              juz={juzNumber}
              part={part}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        })}
      </svg>
      <div className="mt-1 w-16 text-center">
        <span className="text-xs font-medium text-muted-foreground">
          Juz {juzNumber}
        </span>
        <span className="block overflow-hidden whitespace-nowrap text-[10px] text-muted-foreground">
          {juzArabicNames.get(juzNumber)}
        </span>
      </div>
    </div>
  );
};

type JuzSelectionDialogProps = {
  selectedParts: string[];
  onSelectedPartsChange: (parts: string[]) => void;
};

export function JuzSelectionDialog({
  selectedParts,
  onSelectedPartsChange,
}: JuzSelectionDialogProps) {
  const handleSelectPart = (juzPartValue: string) => {
    const newSelectedParts = selectedParts.includes(juzPartValue)
      ? selectedParts.filter((p) => p !== juzPartValue)
      : [...selectedParts, juzPartValue];
    onSelectedPartsChange(newSelectedParts);
  };

  return (
    <div className="grid max-h-[60vh] grid-cols-5 gap-4 overflow-y-auto p-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
      {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNumber) => (
        <SelectableJuzCircle
          key={juzNumber}
          juzNumber={juzNumber}
          selectedParts={selectedParts}
          onSelect={handleSelectPart}
        />
      ))}
    </div>
  );
}
