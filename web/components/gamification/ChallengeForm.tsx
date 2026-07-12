"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreateChallengeSchema, type CreateChallengeInput } from "@/lib/schemas/gamification";
import type { Category } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

interface ChallengeFormProps {
  /** Available categories filtered to CHALLENGE type */
  categories: Pick<Category, "id" | "name">[];
  /** Default values for edit mode */
  defaultValues?: Partial<CreateChallengeInput>;
  /** Called on valid form submission */
  onSubmit: (data: CreateChallengeInput) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ChallengeForm({
  categories,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Create Challenge",
}: ChallengeFormProps) {
  const form = useForm<CreateChallengeInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateChallengeSchema) as any,
    defaultValues: {
      title: "",
      categoryId: "",
      description: "",
      xp: 100,
      difficulty: "MEDIUM",
      evidenceRequired: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Challenge title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Sustainability Sprint"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what participants need to do to complete this challenge…"
                  className="min-h-[100px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* XP + Difficulty row */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="xp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>XP reward</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={10}
                    max={10000}
                    placeholder="100"
                    {...field}
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>10 – 10,000 XP</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EASY">
                      <span className="text-chart-2">Easy</span>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <span className="text-chart-3">Medium</span>
                    </SelectItem>
                    <SelectItem value="HARD">
                      <span className="text-destructive">Hard</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Deadline */}
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  value={
                    field.value
                      ? new Date(field.value).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className="font-mono"
                />
              </FormControl>
              <FormDescription>Must be a future date</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Evidence required toggle */}
        <FormField
          control={form.control}
          name="evidenceRequired"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <FormLabel className="text-sm font-medium">
                  Require evidence
                </FormLabel>
                <FormDescription className="text-xs mt-0.5">
                  Participants must upload a photo or document as proof
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full transition-shadow",
            "hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)]"
          )}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
