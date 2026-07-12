import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getEsgSummaryData } from "@/lib/actions/reports";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EsgScoreRing } from "@/components/dashboard/EsgScoreRing";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { EsgSummaryCharts } from "@/components/reports/EsgSummaryView";
import { Badge } from "@/components/ui/badge";
import { getScoreColorClass } from "@/lib/gamification-utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "ESG Summary — EcoSphere" };

export default async function EsgSummaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const data = await getEsgSummaryData({
    departmentId: params.dept,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ESG Summary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidated ESG performance across all pillars and departments.
          </p>
        </div>
        <ExportButtons reportType="esg-summary" filters={params} />
      </div>

      {/* Score rings */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <h2
          className="text-xs uppercase tracking-widest text-muted-foreground mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Overall ESG Score
        </h2>
        <div className="flex flex-wrap items-center justify-around gap-6">
          <EsgScoreRing score={data.summary.envScore} label="Environmental" size={120} />
          <EsgScoreRing score={data.summary.socialScore} label="Social" size={120} />
          <EsgScoreRing score={data.summary.govScore} label="Governance" size={120} />
          <EsgScoreRing score={data.summary.overallESGScore} label="Overall" size={140} strokeWidth={10} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Overall ESG" value={data.summary.overallESGScore} unit="/ 100" isScore accentColor="var(--chart-1)" />
        <KpiCard title="Best dept." value={data.summary.topDept?.name ?? "—"} subtitle={data.summary.topDept ? `Score: ${data.summary.topDept.total.toFixed(1)}` : ""} accentColor="var(--score-gold)" />
        <KpiCard title="Active challenges" value={data.challengeStats.active} subtitle={`${data.challengeStats.totalParticipations} participations`} accentColor="var(--chart-5)" />
        <KpiCard title="Top employee XP" value={data.topEmployees[0]?.xp ?? 0} subtitle={data.topEmployees[0]?.name} accentColor="var(--score-silver)" />
      </div>

      {/* Charts */}
      <EsgSummaryCharts radarData={data.radarData} />

      {/* Department scores table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Department ESG Scores
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {data.deptScores.map((dept, i) => (
            <div key={dept.code} className={cn("px-5 py-3 grid grid-cols-5 gap-4 items-center hover:bg-accent/30", i % 2 !== 0 && "bg-muted/10")}>
              <div>
                <p className="text-sm font-medium text-foreground">{dept.name}</p>
                <p className="text-xs text-muted-foreground">{dept.code}</p>
              </div>
              {[
                { label: "Env", value: dept.environmental },
                { label: "Social", value: dept.social },
                { label: "Gov", value: dept.governance },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className={cn("text-base font-mono font-medium", getScoreColorClass(value))} style={{ fontFamily: "var(--font-mono)" }}>
                    {value.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
              <div className="text-right">
                <p className={cn("text-lg font-mono font-semibold", getScoreColorClass(dept.total))} style={{ fontFamily: "var(--font-mono)" }}>
                  {dept.total.toFixed(1)}
                </p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
