import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getGovernanceSummary, getIssuesBySeverity } from "@/lib/actions/governance";
import { getMyPendingPolicies } from "@/lib/actions/governance";
import {
  Scale,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Governance — EcoSphere" };

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  MEDIUM: "text-amber-400 bg-amber-400/10",
  LOW: "text-muted-foreground bg-muted/40",
};

export default async function GovernancePage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const [summary, issuesBySeverity, pendingPolicies] = await Promise.all([
    getGovernanceSummary(),
    getIssuesBySeverity(),
    getMyPendingPolicies(),
  ]);

  const kpis = [
    {
      label: "Total Policies",
      value: summary.totalPolicies,
      sub: `${summary.ackRate}% acknowledged`,
      icon: FileCheck,
      color: "text-[--esg-gov]",
      bg: "bg-[--esg-gov]/10",
      href: "/governance/policies",
      good: summary.ackRate >= 80,
    },
    {
      label: "Open Issues",
      value: summary.openIssues + summary.overdueIssues,
      sub: summary.overdueIssues > 0 ? `${summary.overdueIssues} overdue` : "None overdue",
      icon: AlertTriangle,
      color: summary.overdueIssues > 0 ? "text-destructive" : "text-[--esg-gov]",
      bg: summary.overdueIssues > 0 ? "bg-destructive/10" : "bg-[--esg-gov]/10",
      href: "/governance/compliance",
      good: summary.overdueIssues === 0,
    },
    {
      label: "Audits This Quarter",
      value: summary.totalAuditsQ,
      sub: `${summary.auditCompletionRate}% completed`,
      icon: Scale,
      color: "text-[--esg-gov]",
      bg: "bg-[--esg-gov]/10",
      href: "/governance/audits",
      good: summary.auditCompletionRate >= 70,
    },
    {
      label: "Governance Score",
      value: summary.avgGovScore,
      sub: "Avg. across departments",
      icon: ClipboardList,
      color: summary.avgGovScore >= 70 ? "text-[--esg-env]" : "text-[--esg-gov]",
      bg: summary.avgGovScore >= 70 ? "bg-[--esg-env]/10" : "bg-[--esg-gov]/10",
      href: "/governance/compliance",
      good: summary.avgGovScore >= 70,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[--esg-gov]/15 border border-[--esg-gov]/25">
              <Scale className="size-5 text-[--esg-gov]" />
            </div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
              Governance
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-11.5">
            Policy compliance, audits, and risk management.
          </p>
        </div>
      </div>

      {/* Pending policy banner for employees */}
      {pendingPolicies.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 p-4">
          <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {pendingPolicies.length} policy acknowledgement{pendingPolicies.length > 1 ? "s" : ""} required
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and acknowledge the following:{" "}
              {pendingPolicies.map((p) => p.title).join(", ")}
            </p>
          </div>
          <Link
            href="/governance/acknowledgements"
            className="shrink-0 rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/25 transition-colors"
          >
            Review now
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-[--esg-gov]/40 hover:shadow-lg hover:shadow-[--esg-gov]/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("flex size-9 items-center justify-center rounded-lg", kpi.bg)}>
                  <Icon className={cn("size-4.5", kpi.color)} />
                </div>
                {kpi.good ? (
                  <CheckCircle className="size-4 text-[--esg-env]" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
              </div>
              <p className="text-2xl font-bold font-mono text-foreground">{kpi.value}</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">{kpi.label}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{kpi.sub}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-[--esg-gov] transition-colors">
                View details <ChevronRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick nav links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Policies", desc: "Create and manage ESG policies", href: "/governance/policies", icon: FileCheck },
          { label: "Audits", desc: "Schedule and track audits", href: "/governance/audits", icon: Scale },
          { label: "Compliance Issues", desc: "Track and resolve open issues", href: "/governance/compliance", icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-[--esg-gov]/40 hover:bg-card/80 group"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-[--esg-gov]/10">
                <Icon className="size-4.5 text-[--esg-gov]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground ml-auto shrink-0 group-hover:text-[--esg-gov] transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Issues by severity */}
      {issuesBySeverity.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Issues by Severity</h2>
          <div className="space-y-2.5">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
              const entry = issuesBySeverity.find((i) => i.severity === sev);
              const count = entry?.count ?? 0;
              const max = Math.max(...issuesBySeverity.map((i) => i.count), 1);
              return (
                <div key={sev} className="flex items-center gap-3">
                  <span className={cn("w-16 rounded px-1.5 py-0.5 text-center text-[10px] font-semibold", SEVERITY_COLOR[sev])}>
                    {sev}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted/40">
                    <div
                      className={cn("h-full rounded-full transition-all", SEVERITY_COLOR[sev].split(" ")[1].replace("/10", "/60"))}
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-mono text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
