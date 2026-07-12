import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { EsgScoreRing } from "@/components/dashboard/EsgScoreRing";
import { EmissionsTrendChart } from "@/components/dashboard/EmissionsTrendChart";
import { DeptRankingChart } from "@/components/dashboard/DeptRankingChart";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { formatCO2 } from "@/lib/gamification-utils";

export const metadata = {
  title: "Dashboard — EcoSphere",
  description: "Executive ESG performance overview",
};

// ─── Helper: weighted ESG score from DepartmentScores ────────────────────────

function calcOverallScore(
  deptScores: { environmental: number; social: number; governance: number; total: number }[],
  weights: { envWeight: number; socialWeight: number; govWeight: number }
) {
  if (deptScores.length === 0) return { env: 0, social: 0, gov: 0, overall: 0 };
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const env = avg(deptScores.map((d) => d.environmental));
  const social = avg(deptScores.map((d) => d.social));
  const gov = avg(deptScores.map((d) => d.governance));
  const overall =
    env * weights.envWeight +
    social * weights.socialWeight +
    gov * weights.govWeight;
  return { env, social, gov, overall };
}

// ─── Helper: build monthly trend data ────────────────────────────────────────

function buildMonthlyTrend(
  transactions: { date: Date; co2Kg: number; department: { name: string } }[]
) {
  const months: Record<string, Record<string, number>> = {};

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (!months[key]) months[key] = { __label: 0, month: 0 };
    months[key]["__label"] = 0;
    months[key]["month"] = 0;
    const dept = tx.department.name;
    months[key][dept] = (months[key][dept] ?? 0) + tx.co2Kg;
    months[key]["_label"] = label as unknown as number;
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __label, month, ...rest } = data;
      return { month: rest["_label"] as unknown as string, ...rest } as Record<string, number | string>;
    });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // Fetch all data in parallel
  const [esgConfig, deptScores, departments, carbonTxns, recentNotifs, challengeApprovals, complianceIssues] =
    await Promise.all([
      prisma.eSGConfig.findFirst({ where: { id: "singleton" } }),
      prisma.departmentScore.findMany({ include: { department: true } }),
      prisma.department.findMany({
        where: { status: "ACTIVE" },
        include: { departmentScore: true },
      }),
      prisma.carbonTransaction.findMany({
        where: { date: { gte: twelveMonthsAgo } },
        include: { department: { select: { name: true } } },
        orderBy: { date: "asc" },
      }),
      prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          createdAt: true,
        },
      }),
      prisma.challengeParticipation.findMany({
        where: { approval: "APPROVED", completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 5,
        include: {
          employee: { select: { name: true } },
          challenge: { select: { title: true } },
        },
      }),
      prisma.complianceIssue.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { department: { select: { name: true } } },
      }),
    ]);

  const weights = {
    envWeight: esgConfig?.envWeight ?? 0.4,
    socialWeight: esgConfig?.socialWeight ?? 0.3,
    govWeight: esgConfig?.govWeight ?? 0.3,
  };

  const { env, social, gov, overall } = calcOverallScore(deptScores, weights);

  // Total CO2 this period
  const totalCO2 = carbonTxns.reduce((s, t) => s + t.co2Kg, 0);
  const prevPeriodEnd = new Date(twelveMonthsAgo);
  prevPeriodEnd.setFullYear(prevPeriodEnd.getFullYear() - 1);
  const prevTotalCO2 = await prisma.carbonTransaction.aggregate({
    where: {
      date: {
        gte: new Date(now.getFullYear() - 2, now.getMonth() - 11, 1),
        lt: twelveMonthsAgo,
      },
    },
    _sum: { co2Kg: true },
  });
  const prevCO2 = prevTotalCO2._sum.co2Kg ?? 0;
  const co2Delta = prevCO2 > 0 ? ((totalCO2 - prevCO2) / prevCO2) * 100 : 0;

  // Build emissions trend
  const monthlyData = buildMonthlyTrend(carbonTxns);
  const deptNames = [...new Set(carbonTxns.map((t) => t.department.name))];

  // Department ranking data
  const deptRankingData = departments
    .filter((d) => d.departmentScore !== null)
    .map((d) => {
      const s = d.departmentScore;
      return {
        name: d.name,
        code: d.code,
        total: s?.total ?? 0,
        environmental: s?.environmental ?? 0,
        social: s?.social ?? 0,
        governance: s?.governance ?? 0,
      };
    });

  // Activity feed
  type ActivityType =
    | "CSR_APPROVAL"
    | "CHALLENGE_COMPLETION"
    | "BADGE_UNLOCK"
    | "COMPLIANCE_ISSUE"
    | "TRAINING_COMPLETE"
    | "GOAL_UPDATE";

  const activities = [
    ...challengeApprovals.map((cp) => ({
      id: `cp-${cp.id}`,
      type: "CHALLENGE_COMPLETION" as ActivityType,
      title: `${cp.employee.name} completed a challenge`,
      description: cp.challenge.title,
      timestamp: cp.completedAt!,
    })),
    ...complianceIssues.map((ci) => ({
      id: `ci-${ci.id}`,
      type: "COMPLIANCE_ISSUE" as ActivityType,
      title: `Open compliance issue — ${ci.department?.name ?? "General"}`,
      description: ci.description.slice(0, 60) + "…",
      timestamp: ci.createdAt,
    })),
    ...recentNotifs
      .filter((n) => n.type === "BADGE_UNLOCK")
      .slice(0, 3)
      .map((n) => ({
        id: `notif-${n.id}`,
        type: "BADGE_UNLOCK" as ActivityType,
        title: n.title,
        description: n.body,
        timestamp: n.createdAt,
      })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Executive ESG performance overview — live data from all departments.
        </p>
      </div>

      {/* ── Section 1: ESG Score Rings ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <h2
          className="text-xs uppercase tracking-widest text-muted-foreground mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ESG Score Pillars
        </h2>
        <div className="flex flex-wrap items-center justify-around gap-6">
          <EsgScoreRing score={Math.round(env)} label="Environmental" size={120} />
          <EsgScoreRing score={Math.round(social)} label="Social" size={120} />
          <EsgScoreRing score={Math.round(gov)} label="Governance" size={120} />
          <EsgScoreRing score={Math.round(overall)} label="Overall ESG" size={140} strokeWidth={10} />
        </div>
      </div>

      {/* ── Section 2: KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Overall ESG Score"
          value={Math.round(overall)}
          unit="/ 100"
          isScore
          accentColor="var(--chart-1)"
        />
        <KpiCard
          title="Total CO₂ (12 months)"
          value={formatCO2(totalCO2)}
          delta={-co2Delta}
          subtitle="All departments combined"
          accentColor="var(--chart-2)"
        />
        <KpiCard
          title="Active Challenges"
          value={await prisma.challenge.count({ where: { status: "ACTIVE" } })}
          subtitle="Currently running"
          accentColor="var(--score-gold)"
        />
        <KpiCard
          title="Open Compliance Issues"
          value={complianceIssues.length}
          subtitle="Require resolution"
          accentColor={complianceIssues.length > 0 ? "var(--destructive)" : "var(--chart-1)"}
        />
      </div>

      {/* ── Section 3: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmissionsTrendChart data={monthlyData as any} departments={deptNames} />
        <DeptRankingChart departments={deptRankingData} />
      </div>

      {/* ── Section 4: Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivityFeed activities={activities} />
        <QuickActions />
      </div>
    </div>
  );
}
