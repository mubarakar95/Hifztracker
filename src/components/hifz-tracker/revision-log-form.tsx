"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const formSchema = z.object({
  juzPart: z.string().min(1, { message: "Please select a juz part." }),
  date: z.date({ required_error: "Please select a revision date." }),
  quality: z.enum(RevisionQualities, {
    required_error: "Please rate your revision quality.",
  }),
  comments: z.string().optional(),
});

type RevisionLogFormProps = {
  onSubmit: (data: Omit<Revision, "id" | "userId">) => void;
};

export function RevisionLogForm({ onSubmit }: RevisionLogFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      comments: "",
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset({date: new Date(), comments: ""});
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="juzPart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Juz Part (5 pages)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a juz part" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {juzPartStaticData.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                           <span>Juz {option.juz} - Part {option.part}</span>
                           <Badge variant={option.half === "First Half" ? "secondary" : "outline" }>{option.half}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{option.juzName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <Button type="submit">Save Revision</Button>
      </form>
    </Form>
  );
}
