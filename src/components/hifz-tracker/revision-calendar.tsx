"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import type { Revision } from "@/lib/types";
import { halfJuzMap } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type RevisionCalendarProps = {
  revisions: Revision[];
};

type RevisionsByDate = {
  [date: string]: Revision[];
};

export function RevisionCalendar({ revisions }: RevisionCalendarProps) {
  const revisionsByDate = useMemo(() => {
    return revisions.reduce((acc: RevisionsByDate, revision) => {
      const dateString = format(revision.date, "yyyy-MM-dd");
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      acc[dateString].push(revision);
      return acc;
    }, {});
  }, [revisions]);

  const revisedDays = useMemo(() => {
    return Object.keys(revisionsByDate).map((dateStr) => new Date(dateStr));
  }, [revisionsByDate]);

  const modifiers = {
    revised: revisedDays,
  };

  const modifiersStyles = {
    revised: {
      fontWeight: "bold",
      borderColor: "hsl(var(--primary))",
      borderWidth: "2px",
      borderRadius: "var(--radius)",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision Calendar</CardTitle>
        <CardDescription>
          Your revision activity at a glance. Hover over a day for details.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <TooltipProvider>
          <Calendar
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            components={{
              DayContent: ({ date }) => {
                const dateString = format(date, "yyyy-MM-dd");
                const dailyRevisions = revisionsByDate[dateString];
                const dayNumber = date.getDate();

                if (dailyRevisions) {
                  return (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger className="w-full h-full flex items-center justify-center">
                        {dayNumber}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{format(date, "PPP")}</p>
                        <ScrollArea className="max-h-40 mt-2">
                          <div className="flex flex-col gap-2">
                            {dailyRevisions.map((rev) => (
                              <Badge key={rev.id} variant="secondary">
                                {halfJuzMap.get(rev.halfJuz)}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return <div>{dayNumber}</div>;
              },
            }}
          />
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
