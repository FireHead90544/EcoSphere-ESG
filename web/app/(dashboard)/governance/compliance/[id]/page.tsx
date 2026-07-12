import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getComplianceIssueById } from "@/lib/actions/governance";
import { ResolveButton } from "@/app/(dashboard)/governance/compliance/[id]/ResolveButton";
import { ArrowLeft, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/30",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  LOW: "text-muted-foreground bg-muted/40 border-border",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = await getComplianceIssueById(id);
  return { title: issue ? `Compliance Issue — Governance | EcoSphere` : "Not Found" };
}

export default async function ComplianceIssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const issue = await getComplianceIssueById(id);
  if (!issue) notFound();

  const now = new Date();
  const isOverdue = issue.status === "OPEN" && issue.dueDate < now;
  const canResolve = session.user.role === "ADMIN" || issue.ownerId === session.user.id;
  const isResolved = issue.status === "RESOLVED";

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/governance/compliance" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back to issues
      </Link>

      <div className={cn("rounded-xl border p-6 space-y-4", isOverdue ? "border-destructive/30 bg-destructive/5" : "border-border bg-card")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("rounded border px-2 py-0.5 text-xs font-semibold", SEVERITY_STYLE[issue.severity])}>
                {issue.severity}
              </span>
              {isOverdue && (
                <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                  <AlertTriangle className="size-3.5" /> Overdue
                </span>
              )}
              {isResolved && (
                <span className="flex items-center gap-1 text-xs text-[--esg-env] font-medium">
                  <CheckCircle className="size-3.5" /> Resolved
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Compliance Issue
            </h1>
          </div>
          {canResolve && !isResolved && <ResolveButton issueId={issue.id} />}
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{issue.description}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 pt-2 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{issue.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{issue.department?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />Due Date</p>
            <p className={cn("text-sm font-mono font-medium mt-0.5", isOverdue ? "text-destructive" : "text-foreground")}>
              {new Date(issue.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
          {issue.audit && (
            <div>
              <p className="text-xs text-muted-foreground">Linked Audit</p>
              <Link href={`/governance/audits/${issue.audit.id}`} className="text-sm font-medium text-[--esg-gov] hover:underline mt-0.5 block">
                {issue.audit.title}
              </Link>
            </div>
          )}
          {issue.resolvedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Resolved At</p>
              <p className="text-sm font-mono font-medium text-foreground mt-0.5">
                {new Date(issue.resolvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
