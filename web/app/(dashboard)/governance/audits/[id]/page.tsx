import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getAuditById } from "@/lib/actions/governance";
import { AuditStatusButtons } from "@/app/(dashboard)/governance/audits/[id]/AuditStatusButtons";
import { ArrowLeft, Scale, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  UNDER_REVIEW: "bg-[--esg-gov]/10 text-[--esg-gov] border-[--esg-gov]/30",
  COMPLETED: "bg-[--esg-env]/10 text-[--esg-env] border-[--esg-env]/30",
};
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  LOW: "text-muted-foreground bg-muted/40",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditById(id);
  return { title: audit ? `${audit.title} — Audits | EcoSphere` : "Audit Not Found" };
}

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const audit = await getAuditById(id);
  if (!audit) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/governance/audits" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back to audits
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_STYLE[audit.status])}>
              {audit.status.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(audit.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{audit.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {audit.department.name} · Auditor: {audit.auditorName}
          </p>
        </div>
        {isAdmin && <AuditStatusButtons auditId={audit.id} currentStatus={audit.status} />}
      </div>

      {audit.findingsSummary && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Scale className="size-4 text-[--esg-gov]" /> Findings Summary
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{audit.findingsSummary}</p>
        </div>
      )}

      {/* Linked compliance issues */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
          <h2 className="text-sm font-semibold text-foreground">
            Compliance Issues ({audit.complianceIssues.length})
          </h2>
          {isAdmin && (
            <Link
              href={`/governance/compliance/new?auditId=${audit.id}`}
              className="text-xs text-primary hover:underline"
            >
              + Raise issue
            </Link>
          )}
        </div>
        {audit.complianceIssues.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <AlertTriangle className="size-4 opacity-40" />
            No issues found for this audit.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.complianceIssues.map((issue) => (
                <tr key={issue.id} className="bg-card hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-medium", SEVERITY_COLOR[issue.severity])}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link href={`/governance/compliance/${issue.id}`} className="text-foreground hover:text-[--esg-gov] transition-colors line-clamp-1">
                      {issue.description}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">{issue.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
