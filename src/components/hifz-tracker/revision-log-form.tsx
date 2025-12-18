
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { juzPartStaticData, RevisionQualities } from "@/lib/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Revision } from "@/lib/types";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";

const formSchema = z.object({
  juzParts: z
    .array(z.string())
    .min(1, { message: "Please select at least one juz part." }),
  date: z.date({ required_error: "Please select a revision date." }),
  quality: z.enum(RevisionQualities, {
    required_error: "Please rate your revision quality.",
  }),
  comments: z.string().optional(),
});

type RevisionLogFormProps = {
  onSubmit: (data: Omit<Revision, "id" | "userId">, juzPart: string) => void;
};

export function RevisionLogForm({ onSubmit }: RevisionLogFormProps) {
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
      onSubmit({
        date: values.date,
        quality: values.quality,
        comments: values.comments,
        juzPart: juzPart,
      }, juzPart);
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
              <FormLabel>Juz Parts (5 pages)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
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
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <ScrollArea className="h-72">
                    {juzPartStaticData.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted/50"
                        onClick={() => {
                          const currentValues = field.value || [];
                          const newValue = currentValues.includes(option.value)
                            ? currentValues.filter((v) => v !== option.value)
                            : [...currentValues, option.value];
                          field.onChange(newValue);
                        }}
                      >
                        <Checkbox
                          checked={field.value?.includes(option.value)}
                        />
                        <div className="flex w-full cursor-pointer items-center justify-start">
                          <div className="flex w-24 flex-col text-left">
                            <span className="font-medium">
                              Juz {option.juz}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {option.juzName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Part {option.part}</span>
                            <Badge
                              variant={
                                option.half === "First Half"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {option.half}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
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
          name="quality"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Revision Quality</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  {RevisionQualities.map((quality) => (
                    <FormItem
                      key={quality}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={quality} />
                      </FormControl>
                      <FormLabel className="font-normal">{quality}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any notes on this revision? (e.g., areas of difficulty, feelings)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Revision(s)</Button>
      </form>
    </Form>
  );
}
