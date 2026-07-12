"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createAudit } from "@/lib/actions/governance";
import { AuditSchema } from "@/lib/schemas/governance";
import { ArrowLeft, Loader2, Scale } from "lucide-react";
import Link from "next/link";


interface NewAuditFormProps {
  departments: { id: string; name: string }[];
}

// react-hook-form infers z.coerce.date() as unknown, so we use a string-based form type
interface AuditFormValues {
  title: string;
  departmentId: string;
  auditorName: string;
  date: string;
  findingsSummary?: string;
  status: "SCHEDULED" | "COMPLETED" | "UNDER_REVIEW";
}

export function NewAuditForm({ departments }: NewAuditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuditFormValues>({
    defaultValues: { status: "SCHEDULED" },
  });

  function onSubmit(data: AuditFormValues) {
    setServerError(null);
    const parsed = AuditSchema.safeParse({ ...data, date: new Date(data.date) });
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Validation error");
      return;
    }
    startTransition(async () => {
      const result = await createAudit(parsed.data);
      if (result.success) {
        router.push(`/governance/audits/${result.data.id}`);
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/governance/audits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back to audits
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>New Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Schedule a compliance or ESG audit.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="audit-title">Title <span className="text-destructive">*</span></label>
            <input id="audit-title" {...register("title")} placeholder="e.g. Q3 Environmental Compliance Audit" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="audit-dept">Department <span className="text-destructive">*</span></label>
            <select id="audit-dept" {...register("departmentId")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
              <option value="">Select department…</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.departmentId && <p className="text-xs text-destructive">{errors.departmentId.message}</p>}
          </div>

          {/* Auditor + Date row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="audit-auditor">Auditor Name <span className="text-destructive">*</span></label>
              <input id="audit-auditor" {...register("auditorName")} placeholder="e.g. Jane Doe" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
              {errors.auditorName && <p className="text-xs text-destructive">{errors.auditorName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="audit-date">Audit Date <span className="text-destructive">*</span></label>
              <input id="audit-date" type="date" {...register("date")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="audit-status">Status</label>
            <select id="audit-status" {...register("status")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
              <option value="SCHEDULED">Scheduled</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Findings */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="audit-findings">Findings Summary <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea id="audit-findings" {...register("findingsSummary")} rows={4} placeholder="Summarise the key findings…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
          </div>

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all disabled:opacity-50">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Scale className="size-4" />}
            {isPending ? "Creating…" : "Create Audit"}
          </button>
          <Link href="/governance/audits" className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
