"use client";

// Emission Factors Table — DESIGN.md §6.6 data table pattern
// Admin sees Edit/Delete actions; employees see read-only view.

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Zap, AlertTriangle } from "lucide-react";
import { EmissionFactorDialog } from "@/components/environmental/EmissionFactorDialog";
import { deleteEmissionFactor } from "@/lib/actions/environmental/emission-factors";
import type { EmissionFactor } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  factors: EmissionFactor[];
  isAdmin: boolean;
}

export function EmissionFactorsTable({ factors, isAdmin }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFactor, setEditFactor] = useState<EmissionFactor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (factor: EmissionFactor) => {
    setEditFactor(factor);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditFactor(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this emission factor? This cannot be undone.")) return;
    setDeleteError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteEmissionFactor(id);
      setDeletingId(null);
      if (!result.success) setDeleteError(result.error);
    });
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (factors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center gap-3">
        <Zap className="size-12 text-muted-foreground/40" />
        <div>
          <p
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No emission factors configured
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add emission factors to start calculating carbon emissions.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleNew}
            className="mt-2"
          >
            Add emission factor
          </Button>
        )}
        <EmissionFactorDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editFactor={editFactor}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Admin toolbar */}
      {isAdmin && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {factors.length} factor{factors.length !== 1 ? "s" : ""} configured
          </p>
          <Button onClick={handleNew} size="sm">
            + New factor
          </Button>
        </div>
      )}

      {/* Error banner */}
      {deleteError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Activity
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-semibold text-right">
                Factor (kg CO₂)
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Unit
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Source
              </TableHead>
              {isAdmin && (
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground font-semibold text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {factors.map((factor, idx) => (
              <TableRow
                key={factor.id}
                className={cn(
                  "hover:bg-accent/50 transition-colors",
                  idx % 2 === 1 && "bg-muted/20"
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Zap className="size-3.5 text-[--esg-env] shrink-0" />
                    {factor.activity}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-[--esg-env]">
                    {factor.factorKgCO2.toFixed(4)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-xs bg-[--esg-env]/10 text-[--esg-env] border-[--esg-env]/25"
                  >
                    {factor.unit}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {factor.source ?? "—"}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEdit(factor)}
                        aria-label={`Edit ${factor.activity}`}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(factor.id)}
                        disabled={deletingId === factor.id || isPending}
                        aria-label={`Delete ${factor.activity}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmissionFactorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editFactor={editFactor}
      />
    </div>
  );
}
