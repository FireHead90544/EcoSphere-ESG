"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createDepartment, updateDepartment, deleteDepartment } from "@/lib/actions/settings";
import { DepartmentSchema, type DepartmentInput } from "@/lib/schemas/settings";
import { Plus, Pencil, Trash2, Loader2, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/generated/prisma/client";

type Dept = {
  id: string; name: string; code: string; status: Status;
  parent: { name: string } | null;
  _count: { employees: number };
};


interface Props { departments: Dept[] }

type Mode = "create" | "edit";

export function DeptManagement({ departments }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<Dept | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DepartmentInput>();

  function openCreate() {
    setMode("create"); setEditing(null); reset({}); setError(null); setSheetOpen(true);
  }
  function openEdit(dept: Dept) {
    setMode("edit"); setEditing(dept);
    reset({ name: dept.name, code: dept.code, status: dept.status });
    setError(null); setSheetOpen(true);
  }
  function closeSheet() { setSheetOpen(false); setEditing(null); setError(null); }

  function onSubmit(data: DepartmentInput) {
    const parsed = DepartmentSchema.safeParse(data);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Validation error"); return; }
    setError(null);
    startTransition(async () => {
      const result = mode === "create"
        ? await createDepartment(parsed.data)
        : await updateDepartment(editing!.id, parsed.data);
      if (result.success) { closeSheet(); router.refresh(); }
      else setError(result.error);
    });
  }

  function handleDelete(id: string, empCount: number) {
    if (empCount > 0) { setError(`Cannot delete — ${empCount} employees assigned.`); return; }
    if (!confirm("Delete this department?")) return;
    startTransition(async () => {
      const result = await deleteDepartment(id);
      if (result.success) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all">
          <Plus className="size-4" /> New Department
        </button>
      </div>

      {error && !sheetOpen && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Code", "Parent", "Employees", "Status", ""].map((h) => (

                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No departments yet.</td></tr>

            )}
            {departments.map((d) => (
              <tr key={d.id} className="bg-card hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs bg-muted/40 px-2 py-0.5 rounded">{d.code}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.parent?.name ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d._count.employees}</td>


                <td className="px-4 py-3">
                  <span className={cn("rounded px-2 py-0.5 text-xs font-medium", d.status === "ACTIVE" ? "bg-[--esg-env]/10 text-[--esg-env]" : "bg-muted/40 text-muted-foreground")}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(d)} className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil className="size-3.5" /></button>
                    <button onClick={() => handleDelete(d.id, d._count.employees)} className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" disabled={isPending}><Trash2 className="size-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet (slide-over) */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={closeSheet} />
          {/* Panel */}
          <div className="w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">{mode === "create" ? "New Department" : "Edit Department"}</h2>
              </div>
              <button onClick={closeSheet} className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Name <span className="text-destructive">*</span></label>
                <input {...register("name", { required: true })} placeholder="e.g. Engineering" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Code <span className="text-destructive">*</span></label>
                <input {...register("code", { required: true })} placeholder="e.g. ENG" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select {...register("status")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isPending ? "Saving…" : mode === "create" ? "Create" : "Update"}
                </button>
                <button type="button" onClick={closeSheet} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
