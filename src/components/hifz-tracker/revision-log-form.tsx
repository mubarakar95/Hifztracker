"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import type { Revision } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "../ui/dialog";
import { JuzSelectionDialog } from "./juz-selection-dialog";

const formSchema = z.object({
  juzParts: z
    .array(z.string())
    .min(1, { message: "Please select at least one juz part." }),
  date: z.date({ required_error: "Please select a revision date." }),
  comments: z.string().optional(),
});

type RevisionLogFormProps = {
  onSubmit: (data: Omit<Revision, "id" | "userId">, juzPart: string) => void;
};

export function RevisionLogForm({ onSubmit }: RevisionLogFormProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      juzParts: [],
      date: new Date(),
      comments: "",
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    values.juzParts.forEach((juzPart) => {
      onSubmit(
        {
          date: values.date,
          quality: "Excellent", 
          comments: values.comments,
          juzPart: juzPart,
        },
        juzPart
      );
    });
    form.reset({ date: new Date(), comments: "", juzParts: [] });
  }

  const selectedPartsCount = form.watch("juzParts")?.length || 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="juzParts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Juz Parts (5 pages each)</FormLabel>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    {selectedPartsCount > 0
                      ? `${selectedPartsCount} part(s) selected`
                      : "Select juz parts"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Select Juz Parts for Revision</DialogTitle>
                  </DialogHeader>

                  <JuzSelectionDialog
                    selectedParts={field.value || []}
                    onSelectedPartsChange={field.onChange}
                  />

                  <DialogFooter className="flex items-center justify-between sm:justify-between">
                     <Button variant="outline" onClick={() => field.onChange([])}>Clear Selection</Button>
                    <DialogClose asChild>
                      <Button>Confirm Selection</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Revision Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Record any reflections or difficult ayahs..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Save Revision Logs</Button>
      </form>
    </Form>
  );
}