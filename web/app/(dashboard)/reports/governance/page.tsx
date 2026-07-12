import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGovernanceReportData } from "@/lib/actions/reports";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { daysUntil } from "@/lib/gamification-utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Governance Report — EcoSphere" };

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  MEDIUM: "bg-chart-3/15 text-chart-3 border-chart-3/25",
  HIGH: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  CRITICAL: "bg-destructive/15 text-destructive border-destructive/25",
};

const CI_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-chart-3/15 text-chart-3 border-chart-3/25",
  OVERDUE: "bg-destructive/15 text-destructive border-destructive/25",
  RESOLVED: "bg-chart-1/15 text-chart-1 border-chart-1/25",
  IN_PROGRESS: "bg-chart-5/15 text-chart-5 border-chart-5/25",
};

export default async function GovernanceReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const filters = {
    departmentId: params.dept,
    fromDate: params.from ? new Date(params.from) : undefined,
    toDate: params.to ? new Date(params.to) : undefined,
  };

  const [data, departments] = await Promise.all([
    getGovernanceReportData(filters),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, code: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Governance Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Policy acknowledgements, audit outcomes, and compliance tracking.
          </p>
        </div>
        <ExportButtons reportType="governance" filters={params} />
      </div>

      <ReportFilters departments={departments} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Policy ack. rate"
          value={`${Math.round(data.summary.policyAckRate)}%`}
          isScore
          subtitle={`${data.policies.length} policies`}
          accentColor="var(--esg-gov)"
        />
        <KpiCard
          title="Open issues"
          value={data.summary.openIssues}
          subtitle="Require resolution"
          accentColor={data.summary.openIssues > 0 ? "var(--destructive)" : "var(--chart-1)"}
        />
        <KpiCard
          title="Overdue issues"
          value={data.summary.overdueIssues}
          subtitle="Past due date"
          accentColor={data.summary.overdueIssues > 0 ? "var(--destructive)" : "var(--chart-1)"}
        />
        <KpiCard
          title="Audits completed"
          value={`${data.summary.auditsCompleted} / ${data.summary.totalAudits}`}
          subtitle="This period"
          accentColor="var(--chart-5)"
        />
      </div>

      {/* Policies table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Policy Acknowledgements
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.policies.map((policy) => (
            <div key={policy.id} className="px-5 py-3 flex items-center gap-4 hover:bg-accent/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{policy.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Version {policy.version}</p>
              </div>
              <div className="w-28 space-y-1 shrink-0">
                <Progress value={policy.acknowledgeRate} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground font-mono text-right">
                  {policy.acknowledged}/{policy.totalEmployees} ({Math.round(policy.acknowledgeRate)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Issues table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Compliance Issues
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.complianceIssues.map((ci) => {
            const days = ci.dueDate ? daysUntil(ci.dueDate) : null;
            return (
              <div key={ci.id} className="px-5 py-3 flex items-start gap-4 hover:bg-accent/30">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{ci.department?.name ?? "General"}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 line-clamp-2">
                    {ci.description}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-xs border shrink-0", SEVERITY_COLORS[ci.severity])}>
                  {ci.severity}
                </Badge>
                <Badge variant="outline" className={cn("text-xs border shrink-0", CI_STATUS_COLORS[ci.status] ?? "text-muted-foreground")}>
                  {ci.status}
                </Badge>
                {days !== null && (
                  <span className={cn("text-xs shrink-0", days < 0 ? "text-destructive" : "text-muted-foreground")}>
                    {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audits table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Audits
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.audits.map((audit) => (
            <div key={audit.id} className="px-5 py-3 flex items-center gap-4 hover:bg-accent/30">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{audit.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {audit.department.name} · Auditor: {audit.auditorName}
                </p>
                {audit.findingsSummary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{audit.findingsSummary}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(audit.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {audit._count.complianceIssues} issue{audit._count.complianceIssues !== 1 ? "s" : ""}
              </span>
              <Badge variant="outline" className={cn("text-xs border shrink-0",
                audit.status === "COMPLETED" ? "bg-chart-1/15 text-chart-1 border-chart-1/25"
                : audit.status === "SCHEDULED" ? "bg-chart-5/15 text-chart-5 border-chart-5/25"
                : "bg-chart-3/15 text-chart-3 border-chart-3/25"
              )}>
                {audit.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
