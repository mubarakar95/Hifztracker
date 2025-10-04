"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { halfJuzMap, type Revision } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QualityBadge } from "@/components/hifz-tracker/quality-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "../ui/scroll-area";

type RevisionHistoryTableProps = {
  revisions: Revision[];
  onDelete: (id: string) => void;
};

export function RevisionHistoryTable({
  revisions,
  onDelete,
}: RevisionHistoryTableProps) {
  const [itemToDelete, setItemToDelete] = useState<Revision | null>(null);

  const sortedRevisions = [...revisions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision History</CardTitle>
        <CardDescription>
          A detailed log of all your revision sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Half Juz</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRevisions.length > 0 ? (
                sortedRevisions.map((revision) => (
                  <TableRow key={revision.id}>
                    <TableCell className="font-medium">
                      {halfJuzMap.get(revision.halfJuz)}
                    </TableCell>
                    <TableCell>{format(revision.date, "PPP")}</TableCell>
                    <TableCell>
                      <QualityBadge quality={revision.quality} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {revision.comments}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog
                        open={itemToDelete?.id === revision.id}
                        onOpenChange={(isOpen) =>
                          !isOpen && setItemToDelete(null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete(revision)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the revision entry for{" "}
                              <strong>
                                {halfJuzMap.get(revision.halfJuz)}
                              </strong>{" "}
                              on{" "}
                              <strong>{format(revision.date, "PPP")}</strong>.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(revision.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No revisions logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
