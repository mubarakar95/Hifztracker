
"use client";

import { useMemo, useState } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { juzArabicNames, type Revision, type RevisionQuality } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

type RevisionCalendarProps = {
  revisions: Revision[];
};

type RevisionsByDayJuz = {
  [day: number]: {
    [juz: number]: Revision[];
  };
};

const qualityColorMap: Record<RevisionQuality, string> = {
  Excellent: "hsl(var(--primary))",
  Good: "hsl(var(--accent))",
  "Needs Improvement": "hsl(var(--destructive))",
};
const defaultColor = "hsl(var(--muted))";

const MiniJuzCircle = ({ revisions }: { revisions: Revision[] }) => {
  const parts: (Revision | undefined)[] = [
    undefined,
    undefined,
    undefined,
    undefined,
  ];
  revisions.forEach((rev) => {
    const partIndex = (parseInt(rev.juzPart, 10) - 1) % 4;
    // Keep the best quality revision for each part
    if (!parts[partIndex] || parts[partIndex]!.quality !== 'Excellent') {
        parts[partIndex] = rev;
    }
  });

  const getPath = (part: number) => {
    return [
      "M 50 50 L 50 0 A 50 50 0 0 1 100 50 Z", // Top-right
      "M 50 50 L 100 50 A 50 50 0 0 1 50 100 Z", // Bottom-right
      "M 50 50 L 50 100 A 50 50 0 0 1 0 50 Z", // Bottom-left
      "M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z", // Top-left
    ][part - 1];
  };

  return (
    <svg viewBox="0 0 100 100" className="h-6 w-6">
      {parts.map((revision, index) => {
        const color = revision ? qualityColorMap[revision.quality] : defaultColor;
        const partNumber = index + 1;
        return <path key={partNumber} d={getPath(partNumber)} fill={color} />;
      })}
    </svg>
  );
};

export function CustomRevisionCalendar({ revisions }: RevisionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const revisionsByDayJuz = useMemo<RevisionsByDayJuz>(() => {
    const filteredRevisions = revisions.filter(
      (r) =>
        r.date.getMonth() === currentDate.getMonth() &&
        r.date.getFullYear() === currentDate.getFullYear()
    );

    return filteredRevisions.reduce((acc, revision) => {
      const day = revision.date.getDate();
      const juzNumber = Math.floor((parseInt(revision.juzPart, 10) -1) / 4) + 1;

      if (!acc[day]) {
        acc[day] = {};
      }
      if (!acc[day][juzNumber]) {
        acc[day][juzNumber] = [];
      }
      acc[day][juzNumber].push(revision);
      return acc;
    }, {} as RevisionsByDayJuz);
  }, [revisions, currentDate]);

  const daysInMonth = getDaysInMonth(currentDate);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allJuzs = Array.from({ length: 30 }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const getWeekday = (day: number) => {
     const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
     return format(date, 'EEE');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Revision Calendar</CardTitle>
        <CardDescription>
          A day-by-juz grid of your revision history for the month. Each circle shows revised quarters of a Juz.
        </CardDescription>
        <div className="flex items-center justify-center space-x-4 pt-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="relative">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="sticky left-0 z-10 w-24 border-r bg-muted p-2 text-center text-xs font-semibold">
                      Day
                    </th>
                    {allJuzs.map((juz) => (
                      <th
                        key={juz}
                        className="min-w-[40px] p-2 text-center text-xs font-semibold"
                      >
                         <div className="flex flex-col items-center">
                            <span>Juz {juz}</span>
                            <span className="text-[10px] font-normal text-muted-foreground">{juzArabicNames.get(juz)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthDays.map((day) => (
                    <tr
                      key={day}
                      className="border-t transition-colors hover:bg-muted/50"
                    >
                      <td className="sticky left-0 z-10 border-r bg-background p-2 text-center text-xs font-medium">
                        {day} <span className="text-muted-foreground">{getWeekday(day)}</span>
                      </td>
                      {allJuzs.map((juz) => {
                        const cellRevisions = revisionsByDayJuz[day]?.[juz];
                        return (
                          <td
                            key={juz}
                            className="h-10 w-10 border-l p-1 text-center"
                          >
                            {cellRevisions ? (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    <MiniJuzCircle revisions={cellRevisions} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-bold">
                                    {format(
                                      new Date(
                                        currentDate.getFullYear(),
                                        currentDate.getMonth(),
                                        day
                                      ),
                                      "PPP"
                                    )} - Juz {juz}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {cellRevisions.sort((a,b) => parseInt(a.juzPart) - parseInt(b.juzPart)).map((rev) => (
                                      <Badge
                                        key={rev.id}
                                        variant="secondary"
                                        className="block"
                                      >
                                        Part {(parseInt(rev.juzPart) - 1) % 4 + 1} - {rev.quality}
                                      </Badge>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
