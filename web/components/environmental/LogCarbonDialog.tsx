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
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Factory, Leaf } from "lucide-react";
import { logCarbonTransaction } from "@/lib/actions/environmental/carbon-transactions";
import { CarbonTransactionSchema, type CarbonTransactionInput } from "@/lib/schemas/environmental";
import type { EmissionFactor, Department } from "@/lib/generated/prisma/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Pick<Department, "id" | "name">[];
  emissionFactors: EmissionFactor[];
  lockedDepartmentId?: string;
}

const SOURCE_TYPES = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "EXPENSE", label: "Expense" },
  { value: "FLEET", label: "Fleet" },
  { value: "MANUAL", label: "Manual entry" },
] as const;

type ErrMap = Record<string, { message?: string } | undefined>;

export function LogCarbonDialog({ open, onOpenChange, departments, emissionFactors, lockedDepartmentId }: Props) {
  const [isPending, startTransition] = useTransition();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, watch, reset, setError, formState: { errors } } = useForm<any>({
    resolver: zodResolver(CarbonTransactionSchema),
    defaultValues: {
      departmentId: lockedDepartmentId ?? "",
      sourceType: "MANUAL",
      quantity: undefined,
      emissionFactorId: "",
      date: new Date(),
      notes: "",
    },
  });

  const E = errors as ErrMap;
  const watchedFactorId = watch("emissionFactorId");
  const watchedQty = watch("quantity");
  const selectedFactor = emissionFactors.find((f) => f.id === watchedFactorId);
  const livePreviewCO2 =
    selectedFactor && Number(watchedQty) > 0
      ? Math.round(Number(watchedQty) * selectedFactor.factorKgCO2 * 1000) / 1000
      : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: any) => {
    startTransition(async () => {
      const result = await logCarbonTransaction(values as CarbonTransactionInput);
      if (!result.success) { setError("root", { message: result.error }); return; }
      reset();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <Factory className="size-4 text-[--esg-env]" />
            Log Carbon Data
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Department */}
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={!!lockedDepartmentId}>
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

          {/* Source type */}
          <div className="space-y-1.5">
            <Label>Source type</Label>
            <Controller
              name="sourceType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select source…" /></SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Emission factor */}
          <div className="space-y-1.5">
            <Label>Emission factor</Label>
            <Controller
              name="emissionFactorId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={E.emissionFactorId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select emission factor…" />
                  </SelectTrigger>
                  <SelectContent>
                    {emissionFactors.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.activity} <span className="text-muted-foreground ml-1">({f.factorKgCO2} kg CO₂/{f.unit})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {E.emissionFactorId?.message && <p className="text-xs text-destructive">{E.emissionFactorId.message}</p>}
          </div>

          {/* Quantity + Live CO₂ preview */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-qty">
              Quantity
              {selectedFactor && <span className="text-muted-foreground font-normal ml-1">({selectedFactor.unit})</span>}
            </Label>
            <div className="flex items-center gap-3">
              <Input id="tx-qty" type="number" step="0.01" min="0" placeholder="e.g. 100"
                {...register("quantity")} className={`flex-1 ${E.quantity ? "border-destructive" : ""}`} />
              {livePreviewCO2 !== null && (
                <Badge className="shrink-0 bg-[--esg-env]/15 text-[--esg-env] border-[--esg-env]/25 gap-1 font-mono text-xs px-2 py-1">
                  <Leaf className="size-3" />{livePreviewCO2} kg CO₂
                </Badge>
              )}
            </div>
            {E.quantity?.message && <p className="text-xs text-destructive">{E.quantity.message}</p>}
            {livePreviewCO2 !== null && (
              <p className="text-xs text-muted-foreground">Estimated: {livePreviewCO2} kg CO₂</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-date">Date</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Input id="tx-date" type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className={E.date ? "border-destructive" : ""}
                />
              )}
            />
            {E.date?.message && <p className="text-xs text-destructive">{E.date.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="tx-notes" rows={2} placeholder="Additional context…" {...register("notes")} />
          </div>

          {E.root?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{E.root.message}</p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Logging…" : "Log carbon data"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
