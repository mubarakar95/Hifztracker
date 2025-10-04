
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
import type { Revision, RevisionQuality } from "@/lib/types";
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
  Excellent: "bg-primary",
  Good: "bg-accent",
  "Needs Improvement": "bg-destructive",
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
      const juzNumber = Math.floor(parseInt(revision.juzPart, 10) / 4) + 1;

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
          A day-by-juz grid of your revision history for the month.
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
                        Juz {juz}
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
                        const bestQuality = cellRevisions?.reduce(
                          (best, current) => {
                            if (current.quality === "Excellent") return "Excellent";
                            if (current.quality === "Good" && best !== "Excellent") return "Good";
                            return best;
                          },
                          "Needs Improvement" as RevisionQuality
                        );
                        return (
                          <td
                            key={juz}
                            className="h-10 w-10 border-l p-1 text-center"
                          >
                            {cellRevisions ? (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "mx-auto h-6 w-6 rounded-md",
                                      bestQuality &&
                                        qualityColorMap[bestQuality]
                                    )}
                                  ></div>
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
                                    {cellRevisions.map((rev) => (
                                      <Badge
                                        key={rev.id}
                                        variant="secondary"
                                        className="block"
                                      >
                                        Part {parseInt(rev.juzPart) % 4 || 4} - {rev.quality}
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
