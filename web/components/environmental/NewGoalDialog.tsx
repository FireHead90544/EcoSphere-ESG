"use client";

import { useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Target } from "lucide-react";
import { createGoal, updateGoal } from "@/lib/actions/environmental/goals";
import { EnvironmentalGoalSchema, type EnvironmentalGoalInput } from "@/lib/schemas/environmental";
import type { Department, EnvironmentalGoal } from "@/lib/generated/prisma/client";

type ErrMap = Record<string, { message?: string } | undefined>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Pick<Department, "id" | "name">[];
  editGoal?: EnvironmentalGoal | null;
}

export function NewGoalDialog({ open, onOpenChange, departments, editGoal }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!editGoal;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, setError, formState: { errors } } = useForm<any>({
    resolver: zodResolver(EnvironmentalGoalSchema),
    defaultValues: { name: "", departmentId: "", targetCO2Kg: undefined, deadline: undefined },
  });

  const E = errors as ErrMap;

  useEffect(() => {
    if (editGoal) {
      reset({ name: editGoal.name, departmentId: editGoal.departmentId, targetCO2Kg: editGoal.targetCO2Kg, deadline: editGoal.deadline });
    } else {
      reset({ name: "", departmentId: "", targetCO2Kg: undefined, deadline: undefined });
    }
  }, [editGoal, reset, open]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: any) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateGoal(editGoal!.id, values as EnvironmentalGoalInput)
        : await createGoal(values as EnvironmentalGoalInput);
      if (!result.success) { setError("root", { message: result.error }); return; }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <Target className="size-4 text-[--esg-env]" />
            {isEdit ? "Edit Goal" : "New Environmental Goal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Goal name</Label>
            <Input id="goal-name" placeholder="e.g. Reduce Logistics emissions by 30%" {...register("name")} className={E.name ? "border-destructive" : ""} />
            {E.name?.message && <p className="text-xs text-destructive">{E.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={E.departmentId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {E.departmentId?.message && <p className="text-xs text-destructive">{E.departmentId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-target">CO₂ target <span className="text-muted-foreground font-normal">(kg)</span></Label>
            <Input id="goal-target" type="number" step="0.1" min="0" placeholder="e.g. 5000" {...register("targetCO2Kg")} className={E.targetCO2Kg ? "border-destructive" : ""} />
            {E.targetCO2Kg?.message && <p className="text-xs text-destructive">{E.targetCO2Kg.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <Input id="goal-deadline" type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className={E.deadline ? "border-destructive" : ""}
                />
              )}
            />
            {E.deadline?.message && <p className="text-xs text-destructive">{E.deadline.message}</p>}
          </div>

          {E.root?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{E.root.message}</p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
