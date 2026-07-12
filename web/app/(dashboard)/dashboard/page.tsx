import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "@/app/(dashboard)/dashboard/DashboardCharts";
import { ScoreCard } from "@/app/(dashboard)/dashboard/ScoreCard";
import { Leaf, Users, Scale, TrendingUp, Plus, Trophy, FileText, ArrowUpRight, Activity } from "lucide-react";

export const metadata = { title: "Dashboard — EcoSphere" };

async function getDashboardData() {
  const [deptScores, recentNotifications, carbonTrend, deptRankings] = await Promise.all([
    // Latest score snapshot per department
    prisma.departmentScore.findMany({
      orderBy: { computedAt: "desc" },
      include: { department: { select: { name: true, code: true } } },
      take: 20,
    }),
    // Last 8 activity notifications for the feed
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { employee: { select: { name: true } } } } },
    }),
    // 12 months of carbon transactions for trend chart
    (async () => {
      const months: { month: string; co2Kg: number }[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const agg = await prisma.carbonTransaction.aggregate({
          _sum: { co2Kg: true },
          where: { date: { gte: start, lt: end } },
        });
        months.push({
          month: start.toLocaleDateString("en-IN", { month: "short" }),
          co2Kg: Math.round((agg._sum.co2Kg ?? 0) * 10) / 10,
        });
      }
      return months;
    })(),
    // Department ranking — get latest score per dept
    prisma.departmentScore.findMany({
      distinct: ["departmentId"],
      include: { department: { select: { name: true } } },
      orderBy: { computedAt: "desc" },
      take: 10,
    }),

  ]);

  // Aggregate scores — average across all dept scores
  const allScores = deptScores;
  const avg = (field: "environmental" | "social" | "governance" | "total") =>
    allScores.length > 0
      ? Math.round(allScores.reduce((s, d) => s + d[field], 0) / allScores.length)
      : 0;


  return {
    envScore: avg("environmental"),
    socialScore: avg("social"),
    govScore: avg("governance"),
    overallScore: avg("total"),
    carbonTrend,
    deptRankings: deptRankings.map((d) => ({
      name: d.department.name,
      overall: Math.round(d.total),

      environmental: Math.round(d.environmental),
      social: Math.round(d.social),
      governance: Math.round(d.governance),
    })),
    recentActivity: recentNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      link: n.link,
      createdAt: n.createdAt,
      actorName: n.user?.employee?.name ?? "System",
    })),
  };
}

const TYPE_ICON: Record<string, string> = {
  COMPLIANCE_ISSUE: "🚨",
  CSR_APPROVAL: "🌱",
  CHALLENGE_APPROVAL: "🏆",
  POLICY_REMINDER: "📋",
  BADGE_UNLOCK: "🎖️",
  GENERAL: "📢",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const data = await getDashboardData();

  const kpis = [
    { label: "Environmental", value: data.envScore, iconSlot: <Leaf className="size-4.5 text-[--esg-env]" />, color: "text-[--esg-env]", bg: "bg-[--esg-env]/10", border: "border-[--esg-env]/20" },
    { label: "Social", value: data.socialScore, iconSlot: <Users className="size-4.5 text-[--esg-social]" />, color: "text-[--esg-social]", bg: "bg-[--esg-social]/10", border: "border-[--esg-social]/20" },
    { label: "Governance", value: data.govScore, iconSlot: <Scale className="size-4.5 text-[--esg-gov]" />, color: "text-[--esg-gov]", bg: "bg-[--esg-gov]/10", border: "border-[--esg-gov]/20" },
    { label: "Overall ESG", value: data.overallScore, iconSlot: <TrendingUp className="size-4.5 text-primary" />, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", featured: true as const },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's your organisation's ESG overview.
        </p>
      </div>

      {/* KPI Score Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <ScoreCard key={kpi.label} {...kpi} />
        ))}
      </div>


      {/* Charts row */}
      <DashboardCharts carbonTrend={data.carbonTrend} deptRankings={data.deptRankings} />

      {/* Bottom row: Activity + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent activity — 2/3 width */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            </div>
            <Link href="/notifications" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">No recent activity.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentActivity.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link ?? "/notifications"}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-accent/30 transition-colors group"
                  >
                    <span className="text-base mt-0.5 shrink-0">{TYPE_ICON[item.type] ?? "📢"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.body}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions — 1/3 width */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              href="/environmental/carbon/new"
              className="flex items-center gap-3 w-full rounded-xl border border-[--esg-env]/30 bg-[--esg-env]/8 px-4 py-3 text-sm font-medium text-[--esg-env] hover:bg-[--esg-env]/15 hover:shadow-md transition-all group"
            >
              <Plus className="size-4 shrink-0" />
              <span className="flex-1">Log Carbon Data</span>
              <ArrowUpRight className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/gamification/challenges"
              className="flex items-center gap-3 w-full rounded-xl border border-[--score-gold]/30 bg-[--score-gold]/8 px-4 py-3 text-sm font-medium text-[--score-gold] hover:bg-[--score-gold]/15 hover:shadow-md transition-all group"
            >
              <Trophy className="size-4 shrink-0" />
              <span className="flex-1">Browse Challenges</span>
              <ArrowUpRight className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/reports/esg-summary"
              className="flex items-center gap-3 w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 hover:shadow-md transition-all group"
            >
              <FileText className="size-4 shrink-0" />
              <span className="flex-1">ESG Report</span>
              <ArrowUpRight className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/governance/policies"
              className="flex items-center gap-3 w-full rounded-xl border border-[--esg-gov]/30 bg-[--esg-gov]/8 px-4 py-3 text-sm font-medium text-[--esg-gov] hover:bg-[--esg-gov]/15 hover:shadow-md transition-all group"
            >
              <Scale className="size-4 shrink-0" />
              <span className="flex-1">View Policies</span>
              <ArrowUpRight className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
