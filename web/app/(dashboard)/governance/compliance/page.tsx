import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getComplianceIssues } from "@/lib/actions/governance";
import { AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Compliance Issues — Governance | EcoSphere" };

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/20",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  LOW: "text-muted-foreground bg-muted/40 border-border",
};

const STATUS_STYLE: Record<string, string> = {
  OPEN: "text-blue-400 bg-blue-400/10",
  OVERDUE: "text-destructive bg-destructive/10",
  RESOLVED: "text-[--esg-env] bg-[--esg-env]/10",
};

export default async function CompliancePage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const issues = await getComplianceIssues();

  const overdueCount = issues.filter((i) => i.isOverdue).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Compliance Issues
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {issues.length} issue{issues.length !== 1 ? "s" : ""}
            {overdueCount > 0 && (
              <span className="ml-2 text-destructive font-medium">· {overdueCount} overdue</span>
            )}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/governance/compliance/new"
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all"
          >
            <Plus className="size-4" />
            Raise Issue
          </Link>
        )}
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{overdueCount} issue{overdueCount > 1 ? "s" : ""}</span> past their due date and require immediate attention.
          </p>
        </div>
      )}

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16">
          <AlertTriangle className="size-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No compliance issues. All clear!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/governance/compliance/${issue.id}`}
              className={cn(
                "flex items-start gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md group",
                issue.isOverdue
                  ? "border-l-4 border-l-destructive border-destructive/20 bg-destructive/3"
                  : "border-border hover:border-[--esg-gov]/30"
              )}
            >
              {/* Severity */}
              <span className={cn("mt-0.5 shrink-0 rounded border px-2 py-0.5 text-xs font-semibold", SEVERITY_STYLE[issue.severity])}>
                {issue.severity}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-[--esg-gov] transition-colors">
                  {issue.description}
                </p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {issue.department && (
                    <span className="text-xs text-muted-foreground">{issue.department.name}</span>
                  )}
                  {issue.audit && (
                    <span className="text-xs text-muted-foreground">· {issue.audit.title}</span>
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    Due: {new Date(issue.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              </div>

              {/* Status */}
              <span className={cn("shrink-0 self-start rounded px-2 py-0.5 text-xs font-medium", STATUS_STYLE[issue.isOverdue ? "OVERDUE" : issue.status])}>
                {issue.isOverdue && issue.status !== "RESOLVED" ? "Overdue" : issue.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
