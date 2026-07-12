"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/settings";
import type { CategoryInput } from "@/lib/schemas/settings";
import { Plus, Pencil, Trash2, Loader2, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, CategoryType, Status } from "@/lib/generated/prisma/client";

const TYPE_LABEL: Record<CategoryType, string> = {
  CSR_ACTIVITY: "CSR Activity",
  CHALLENGE: "Challenge",
};

const TYPE_COLOR: Record<CategoryType, string> = {
  CSR_ACTIVITY: "bg-[--esg-social]/10 text-[--esg-social]",
  CHALLENGE: "bg-[--score-gold]/10 text-[--score-gold]",
};


interface Props { categories: Category[] }

export function CategoryManagement({ categories }: Props) {
  const [filter, setFilter] = useState<"ALL" | CategoryType>("ALL");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<CategoryInput>();

  const filtered = filter === "ALL" ? categories : categories.filter((c) => c.type === filter);

  function openCreate() {
    setEditing(null); reset({ type: "CSR_ACTIVITY", status: "ACTIVE" }); setError(null); setSheetOpen(true);
  }
  function openEdit(cat: Category) {
    setEditing(cat); reset({ name: cat.name, type: cat.type, status: cat.status }); setError(null); setSheetOpen(true);
  }
  function closeSheet() { setSheetOpen(false); setEditing(null); setError(null); }

  function onSubmit(data: CategoryInput) {
    startTransition(async () => {
      const result = editing
        ? await updateCategory(editing.id, data)
        : await createCategory(data);
      if (result.success) { closeSheet(); router.refresh(); }
      else setError(result.error);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    startTransition(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all">
          <Plus className="size-4" /> New Category
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {(["ALL", "CSR_ACTIVITY", "CHALLENGE"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", filter === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            {t === "ALL" ? "All" : TYPE_LABEL[t]}
          </button>
        ))}

      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Name", "Type", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No categories found.</td></tr>
            )}
            {filtered.map((cat) => (
              <tr key={cat.id} className="bg-card hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                <td className="px-4 py-3"><span className={cn("rounded px-2 py-0.5 text-xs font-medium", TYPE_COLOR[cat.type])}>{TYPE_LABEL[cat.type]}</span></td>
                <td className="px-4 py-3"><span className={cn("rounded px-2 py-0.5 text-xs font-medium", cat.status === "ACTIVE" ? "bg-[--esg-env]/10 text-[--esg-env]" : "bg-muted/40 text-muted-foreground")}>{cat.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => openEdit(cat)} className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil className="size-3.5" /></button>
                    <button onClick={() => handleDelete(cat.id)} className="rounded p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="size-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={closeSheet} />
          <div className="w-full max-w-sm bg-card border-l border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2"><Tag className="size-4 text-muted-foreground" /><h2 className="text-sm font-semibold">{editing ? "Edit Category" : "New Category"}</h2></div>
              <button onClick={closeSheet} className="rounded p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
                <input {...register("name", { required: true })} placeholder="e.g. Tree Planting" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <select {...register("type")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80">
                  <option value="CSR_ACTIVITY">CSR Activity</option>
                  <option value="CHALLENGE">Challenge</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select {...register("status")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Saving…" : editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={closeSheet} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
