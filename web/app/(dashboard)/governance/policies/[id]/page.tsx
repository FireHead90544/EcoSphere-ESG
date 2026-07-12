import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getPolicyById } from "@/lib/actions/governance";
import { AcknowledgeButton } from "./AcknowledgeButton";
import { ArrowLeft, FileCheck, Check, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await getPolicyById(id);
  return { title: policy ? `${policy.title} — Policies | EcoSphere` : "Policy Not Found" };
}

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const policy = await getPolicyById(id);

  if (!policy) notFound();

  const employeeId = session.user.employeeId;
  const myAck = policy.acknowledgements.find((a) => a.employeeId === employeeId);
  const hasAcknowledged = !!myAck?.acknowledgedAt;
  const isEmployee = session.user.role === "EMPLOYEE";

  const acknowledgedCount = policy.acknowledgements.filter((a) => a.acknowledgedAt).length;
  const totalCount = policy.acknowledgements.length;
  const ackPct = totalCount > 0 ? Math.round((acknowledgedCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/governance/policies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to policies
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded px-2 py-0.5 text-xs font-mono font-medium bg-[--esg-gov]/10 text-[--esg-gov]">
              v{policy.version}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(policy.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            {policy.title}
          </h1>
        </div>

        {/* Acknowledgement status for employee */}
        {isEmployee && (
          hasAcknowledged ? (
            <div className="flex items-center gap-2 rounded-xl border border-[--esg-env]/30 bg-[--esg-env]/8 px-4 py-2">
              <Check className="size-4 text-[--esg-env]" />
              <div>
                <p className="text-sm font-medium text-[--esg-env]">Acknowledged</p>
                <p className="text-[11px] text-muted-foreground">
                  {myAck?.acknowledgedAt
                    ? new Date(myAck.acknowledgedAt).toLocaleDateString("en-IN")
                    : ""}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-2">
              <Clock className="size-4 text-amber-400" />
              <p className="text-sm font-medium text-amber-400">Pending acknowledgement</p>
            </div>
          )
        )}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-muted-foreground">Acknowledgement progress</span>
          <span className="font-mono font-medium text-foreground">{acknowledgedCount}/{totalCount} employees</span>
        </div>
        <div className="h-2 rounded-full bg-muted/40">
          <div
            className={cn("h-full rounded-full transition-all", ackPct >= 80 ? "bg-[--esg-env]" : ackPct >= 50 ? "bg-[--esg-gov]" : "bg-destructive")}
            style={{ width: `${ackPct}%` }}
          />
        </div>
      </div>

      {/* Policy body */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="size-4 text-[--esg-gov]" />
          <h2 className="text-sm font-semibold text-foreground">Policy Content</h2>
        </div>
        <div className="prose prose-sm prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
            {policy.body}
          </pre>
        </div>
      </div>

      {/* Acknowledge button for employees who haven't yet */}
      {isEmployee && !hasAcknowledged && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
          <p className="text-sm text-muted-foreground mb-4">
            By clicking the button below, you confirm that you have read and understood this policy.
          </p>
          <AcknowledgeButton policyId={policy.id} />
        </div>
      )}

      {/* Acknowledgement table (admin / visible to all) */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">Employee Acknowledgements</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Department</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Acknowledged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {policy.acknowledgements.map((ack) => (
              <tr key={ack.id} className="bg-card hover:bg-accent/20 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shrink-0">
                      <User className="size-3.5" />
                    </div>
                    <span className="font-medium text-foreground">{ack.employee.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground">{ack.employee.department?.name ?? "—"}</span>
                </td>
                <td className="px-4 py-2.5">
                  {ack.acknowledgedAt ? (
                    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-[--esg-env]/10 text-[--esg-env]">
                      <Check className="size-3" /> Acknowledged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400">
                      <Clock className="size-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  <span className="text-xs font-mono text-muted-foreground">
                    {ack.acknowledgedAt
                      ? new Date(ack.acknowledgedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
