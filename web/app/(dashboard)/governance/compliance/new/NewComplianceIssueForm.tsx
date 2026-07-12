"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { createComplianceIssue } from "@/lib/actions/governance";
import { ComplianceIssueSchema } from "@/lib/schemas/governance";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Props {
  departments: { id: string; name: string }[];
  audits: { id: string; title: string }[];
  employees: { userId: string; name: string; departmentName: string | null }[];
}

// react-hook-form with z.coerce.date() infers unknown — use string form type, coerce on submit
interface ComplianceFormValues {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  ownerId: string;
  dueDate: string;
  auditId?: string;
  departmentId?: string;
}

export function NewComplianceIssueForm({ departments, audits, employees }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAuditId = searchParams.get("auditId") ?? "";
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm<ComplianceFormValues>({
    defaultValues: { severity: "MEDIUM", auditId: defaultAuditId || undefined },
  });

  function onSubmit(data: ComplianceFormValues) {
    setServerError(null);
    const parsed = ComplianceIssueSchema.safeParse({
      ...data,
      dueDate: new Date(data.dueDate),
      auditId: data.auditId || undefined,
      departmentId: data.departmentId || undefined,
    });
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Validation error");
      return;
    }
    startTransition(async () => {
      const result = await createComplianceIssue(parsed.data);
      if (result.success) {
        router.push(`/governance/compliance/${result.data.id}`);
      } else {
        setServerError(result.error);
      }
    });
  }

  // Tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/governance/compliance" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back to issues
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Raise Compliance Issue</h1>
        <p className="text-sm text-muted-foreground mt-1">The assigned owner will be notified immediately.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Severity */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="issue-severity">Severity <span className="text-destructive">*</span></label>
            <select id="issue-severity" {...register("severity")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="issue-desc">Description <span className="text-destructive">*</span></label>
            <textarea id="issue-desc" {...register("description", { required: true, minLength: 10 })} rows={4} placeholder="Describe the compliance issue in detail…" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
          </div>

          {/* Owner */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="issue-owner">Assign To <span className="text-destructive">*</span></label>
            <select id="issue-owner" {...register("ownerId", { required: true })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.userId} value={e.userId}>
                  {e.name}{e.departmentName ? ` (${e.departmentName})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Department + Due date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="issue-dept">Department <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select id="issue-dept" {...register("departmentId")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
                <option value="">None</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="issue-due">Due Date <span className="text-destructive">*</span></label>
              <input id="issue-due" type="date" min={minDate} {...register("dueDate", { required: true })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all" />
            </div>
          </div>

          {/* Linked audit */}
          {audits.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="issue-audit">Linked Audit <span className="text-muted-foreground font-normal">(optional)</span></label>
              <select id="issue-audit" {...register("auditId")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all">
                <option value="">None</option>
                {audits.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
          )}

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all disabled:opacity-50">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <AlertTriangle className="size-4" />}
            {isPending ? "Raising…" : "Raise Issue"}
          </button>
          <Link href="/governance/compliance" className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
