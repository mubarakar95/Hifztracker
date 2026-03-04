"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import { juzPartMap, type Revision } from "@/lib/types";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "../ui/separator";

type RevisionHistoryTableProps = {
  revisions: Revision[];
  onDelete: (id: string) => void;
};

export function RevisionHistoryTable({
  revisions,
  onDelete,
}: RevisionHistoryTableProps) {
  const [itemToDelete, setItemToDelete] = useState<Revision | null>(null);
  const isMobile = useIsMobile();

  const sortedRevisions = [...revisions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const MobileView = () => (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {sortedRevisions.length > 0 ? (
          sortedRevisions.map((revision) => (
            <div key={revision.id} className="rounded-lg border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold">{juzPartMap.get(revision.juzPart)}</span>
                 <AlertDialog
                  open={itemToDelete?.id === revision.id}
                  onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setItemToDelete(revision)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the revision entry for{" "}
                        <strong>{juzPartMap.get(revision.juzPart)}</strong> on{" "}
                        <strong>{format(revision.date, "PPP")}</strong>. This
                        action cannot be undone.
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
              </div>
              <p className="text-muted-foreground">{format(revision.date, "PPP")}</p>
              {revision.comments && (
                <>
                  <Separator className="my-2" />
                  <p className="mt-2 text-muted-foreground italic">"{revision.comments}"</p>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No revisions logged yet.
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const DesktopView = () => (
     <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Juz Part</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRevisions.length > 0 ? (
                sortedRevisions.map((revision) => (
                  <TableRow key={revision.id}>
                    <TableCell className="font-medium">
                      {juzPartMap.get(revision.juzPart)}
                    </TableCell>
                    <TableCell>{format(revision.date, "PPP")}</TableCell>
                    <TableCell className="max-w-xs truncate italic">
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
                                {juzPartMap.get(revision.juzPart)}
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
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No revisions logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
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
        {isMobile ? <MobileView /> : <DesktopView />}
      </CardContent>
    </Card>
  );
}
