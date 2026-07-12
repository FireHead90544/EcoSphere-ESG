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
import { Textarea } from "@/components/ui/textarea";
import { Factory, Leaf } from "lucide-react";
import { createProductESGProfile, updateProductESGProfile } from "@/lib/actions/environmental/products";
import { ProductESGProfileSchema, type ProductESGProfileInput } from "@/lib/schemas/environmental";
import type { ProductESGProfile } from "@/lib/generated/prisma/client";

type ErrMap = Record<string, { message?: string } | undefined>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProfile?: ProductESGProfile | null;
}

export function ProductESGDialog({ open, onOpenChange, editProfile }: Props) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!editProfile;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, watch, setValue, setError, formState: { errors } } = useForm<any>({
    resolver: zodResolver(ProductESGProfileSchema),
    defaultValues: { productName: "", co2PerUnit: 0, recyclable: false, notes: "" },
  });

  const E = errors as ErrMap;
  const recyclable = watch("recyclable") as boolean;

  useEffect(() => {
    if (editProfile) {
      reset({ productName: editProfile.productName, co2PerUnit: editProfile.co2PerUnit, recyclable: editProfile.recyclable, notes: editProfile.notes ?? "" });
    } else {
      reset({ productName: "", co2PerUnit: 0, recyclable: false, notes: "" });
    }
  }, [editProfile, reset, open]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (values: any) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateProductESGProfile(editProfile!.id, values as ProductESGProfileInput)
        : await createProductESGProfile(values as ProductESGProfileInput);
      if (!result.success) { setError("root", { message: result.error }); return; }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            <Factory className="size-4 text-[--esg-env]" />
            {isEdit ? "Edit Product Profile" : "New Product ESG Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Product name</Label>
            <Input id="prod-name" placeholder="e.g. Steel Sheet" {...register("productName")} className={E.productName ? "border-destructive" : ""} />
            {E.productName?.message && <p className="text-xs text-destructive">{E.productName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-co2">CO₂ per unit <span className="text-muted-foreground font-normal">(kg)</span></Label>
            <Input id="prod-co2" type="number" step="0.001" min="0" placeholder="e.g. 1.850" {...register("co2PerUnit")} className={E.co2PerUnit ? "border-destructive" : ""} />
            {E.co2PerUnit?.message && <p className="text-xs text-destructive">{E.co2PerUnit.message}</p>}
          </div>

          {/* Recyclable toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={recyclable}
              onClick={() => setValue("recyclable", !recyclable)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${recyclable ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${recyclable ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <div className="flex items-center gap-1.5">
              <Leaf className={`size-4 ${recyclable ? "text-[--esg-env]" : "text-muted-foreground"}`} />
              <Label className="cursor-pointer font-normal">Product is recyclable / compostable</Label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="prod-notes" placeholder="Additional ESG notes…" rows={3} {...register("notes")} />
          </div>

          {E.root?.message && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{E.root.message}</p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create profile"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
