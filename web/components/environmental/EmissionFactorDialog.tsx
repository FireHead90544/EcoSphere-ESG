"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { createEmissionFactor, updateEmissionFactor } from "@/lib/actions/environmental/emission-factors";
import { EmissionFactorSchema, type EmissionFactorInput } from "@/lib/schemas/environmental";
import type { EmissionFactor } from "@/lib/generated/prisma/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFactor?: EmissionFactor | null;
  onSuccess?: () => void;
}

// Helper: extract error message from useForm<any> errors object
function fieldErr(errors: Record<string, unknown>, key: string): string | undefined {
  const e = errors[key] as { message?: unknown } | undefined;
  return typeof e?.message === "string" ? e.message : undefined;
}

export function EmissionFactorDialog({ open, onOpenChange, editFactor, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!editFactor;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<any>({
    resolver: zodResolver(EmissionFactorSchema),
    defaultValues: { activity: "", factorKgCO2: undefined, unit: "", source: "" },
  });

  useEffect(() => {
    if (editFactor) {
      reset({ activity: editFactor.activity, factorKgCO2: editFactor.factorKgCO2, unit: editFactor.unit, source: editFactor.source ?? "" });
    } else {
      reset({ activity: "", factorKgCO2: undefined, unit: "", source: "" });
    }
  }, [editFactor, reset, open]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: any) => {
    startTransition(async () => {
      const v = values as EmissionFactorInput;
      const result = isEdit ? await updateEmissionFactor(editFactor!.id, v) : await createEmissionFactor(v);
      if (!result.success) { setError("root", { message: result.error }); return; }
      onOpenChange(false);
      onSuccess?.();
    });
  };

  const E = errors as Record<string, { message?: string } | undefined>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <Zap className="size-4 text-[--esg-env]" />
            {isEdit ? "Edit Emission Factor" : "New Emission Factor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ef-activity">Activity</Label>
            <Input id="ef-activity" placeholder="e.g. Diesel (litre)" {...register("activity")} className={E.activity ? "border-destructive" : ""} />
            {E.activity?.message && <p className="text-xs text-destructive">{E.activity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ef-factor">Factor <span className="text-muted-foreground font-normal">(kg CO₂ per unit)</span></Label>
            <Input id="ef-factor" type="number" step="0.0001" min="0" placeholder="e.g. 2.6800" {...register("factorKgCO2")} className={E.factorKgCO2 ? "border-destructive" : ""} />
            {E.factorKgCO2?.message && <p className="text-xs text-destructive">{E.factorKgCO2.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ef-unit">Unit</Label>
            <Input id="ef-unit" placeholder="e.g. litre, kWh, km" {...register("unit")} className={E.unit ? "border-destructive" : ""} />
            {E.unit?.message && <p className="text-xs text-destructive">{E.unit.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ef-source">Source <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input id="ef-source" placeholder="e.g. IPCC AR6, GHG Protocol" {...register("source")} />
          </div>

          {E.root?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{E.root.message}</p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create factor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
