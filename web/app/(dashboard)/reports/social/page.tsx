import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSocialReportData } from "@/lib/actions/reports";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Social Report — EcoSphere" };

const APPROVAL_COLORS: Record<string, string> = {
  OPEN: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  CLOSED: "bg-muted/40 text-muted-foreground border-border",
};

export default async function SocialReportPage({
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
    getSocialReportData(filters),
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
            Social Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            CSR participation, training completion, and workforce diversity.
          </p>
        </div>
        <ExportButtons reportType="social" filters={params} />
      </div>

      <ReportFilters departments={departments} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="CSR Activities"
          value={data.summary.totalActivities}
          subtitle="Total activities"
          accentColor="var(--esg-social)"
        />
        <KpiCard
          title="Participation rate"
          value={`${Math.round(
            data.summary.totalParticipations > 0
              ? (data.approvalBreakdown.approved / data.summary.totalParticipations) * 100
              : 0
          )}%`}
          subtitle="Approved participations"
          accentColor="var(--chart-2)"
        />
        <KpiCard
          title="Training completion"
          value={`${Math.round(data.summary.trainingCompletionRate)}%`}
          isScore
          subtitle="Across all employees"
          accentColor="var(--chart-1)"
        />
        <KpiCard
          title="Total participations"
          value={data.summary.totalParticipations}
          subtitle={`${data.approvalBreakdown.pending} pending`}
          accentColor="var(--chart-5)"
        />
      </div>

      {/* CSR Activities table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CSR Activities
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.activities.map((activity) => (
            <div
              key={activity.id}
              className="px-5 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.category.name}
                  {activity.department && ` · ${activity.department.name}`}
                </p>
              </div>
              <span
                className="text-sm font-mono text-muted-foreground shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {activity._count.participations} joined
              </span>
              <span
                className="text-sm font-mono text-[--score-gold] shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                +{activity.xpReward} XP
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs border shrink-0",
                  APPROVAL_COLORS[activity.status] ?? "text-muted-foreground border-border"
                )}
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Training table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h3
            className="text-sm font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Training Records
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.training.map((record) => (
            <div
              key={record.id}
              className="px-5 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{record.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {record.employee.name} · {record.employee.department.name}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs border",
                  record.completed
                    ? "bg-chart-1/15 text-chart-1 border-chart-1/25"
                    : "bg-muted/40 text-muted-foreground border-border"
                )}
              >
                {record.completed ? "Completed" : "In Progress"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
