// Environmental Dashboard — /environmental
// Server Component: fetches all data in one round-trip, passes to client components.

import { Suspense } from "react";
import { getEnvironmentalDashboardData } from "@/lib/actions/environmental/dashboard";
import { requireAuth } from "@/lib/auth-utils";
import { EnvironmentalKpiRow } from "@/components/environmental/EnvironmentalKpiRow";
import { EmissionsTrendChart } from "@/components/environmental/EmissionsTrendChart";
import { RecentTransactionsFeed } from "@/components/environmental/RecentTransactionsFeed";
import { GoalProgressBar } from "@/components/environmental/GoalProgressBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Environmental — EcoSphere",
  description: "Environmental module dashboard with CO₂ emissions, goals, and sustainability scores.",
};

const STATUS_CONFIG = {
  ON_TRACK:  { label: "On Track", cls: "bg-[--esg-env]/15 text-[--esg-env] border-[--esg-env]/25" },
  AT_RISK:   { label: "At Risk",  cls: "bg-[--chart-4]/15 text-[--chart-4] border-[--chart-4]/25" },
  COMPLETED: { label: "Completed", cls: "bg-primary/15 text-primary border-primary/25" },
  ACTIVE:    { label: "Active",   cls: "bg-muted text-muted-foreground border-border" },
} as const;

export default async function EnvironmentalDashboardPage() {
  await requireAuth();
  const data = await getEnvironmentalDashboardData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
          <Leaf className="size-5 text-[--esg-env]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Environmental
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Carbon emissions, sustainability goals, and environmental performance.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <EnvironmentalKpiRow kpis={data.kpis} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EmissionsTrendChart data={data.trendData} />
        </div>
        <RecentTransactionsFeed transactions={data.recentTransactions} />
      </div>

      {/* Goals summary */}
      {data.goalsSummary.length > 0 && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--chart-1]/60 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle
                className="text-sm font-semibold flex items-center gap-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Target className="size-4 text-[--esg-env]" />
                Active Goals
              </CardTitle>
              <a
                href="/environmental/goals"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.goalsSummary.map((goal, idx) => {
                const statusCfg =
                  STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] ??
                  STATUS_CONFIG.ACTIVE;
                return (
                  <div
                    key={goal.id}
                    className="space-y-2 animate-in fade-in duration-300"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{goal.name}</p>
                        <p className="text-[11px] text-muted-foreground">{goal.departmentName}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0", statusCfg.cls)}>
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <GoalProgressBar
                      currentCO2={goal.currentCO2Kg}
                      targetCO2={goal.targetCO2Kg}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
