import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChallengesClientActions } from "@/components/gamification/ChallengesClientActions";
import {
  Trophy,
  Plus,
  Layers,
  Zap,
  Eye,
  CheckCircle2,
  Archive,
} from "lucide-react";
import Link from "next/link";
import type { ChallengeStatus } from "@/lib/generated/prisma/client";

export const metadata = {
  title: "Challenges — EcoSphere",
  description: "Sustainability challenges to earn XP and drive ESG performance",
};

const STATUS_TABS: {
  value: ChallengeStatus;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "DRAFT", label: "Draft", icon: Layers },
  { value: "ACTIVE", label: "Active", icon: Zap },
  { value: "UNDER_REVIEW", label: "Under Review", icon: Eye },
  { value: "COMPLETED", label: "Completed", icon: CheckCircle2 },
  { value: "ARCHIVED", label: "Archived", icon: Archive },
];

export default async function ChallengesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const challenges = await prisma.challenge.findMany({
    include: {
      category: { select: { name: true } },
      _count: { select: { participations: true } },
      participations: employee
        ? {
            where: { employeeId: employee.id },
            select: { progress: true, approval: true },
          }
        : false,
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = challenges.reduce<
    Record<ChallengeStatus, typeof challenges>
  >(
    (acc, c) => {
      acc[c.status] = [...(acc[c.status] || []), c];
      return acc;
    },
    { DRAFT: [], ACTIVE: [], UNDER_REVIEW: [], COMPLETED: [], ARCHIVED: [] }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Challenges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sustainability challenges that earn XP and drive ESG performance.
          </p>
        </div>
        {isAdmin && (
          <Link href="/gamification/challenges/new">
            <Button className="gap-2 transition-shadow hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)]">
              <Plus className="size-4" />
              New Challenge
            </Button>
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active", count: grouped.ACTIVE.length, color: "text-chart-1" },
          { label: "Under Review", count: grouped.UNDER_REVIEW.length, color: "text-chart-5" },
          { label: "Completed", count: grouped.COMPLETED.length, color: "text-chart-2" },
          { label: "Total", count: challenges.length, color: "text-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3">
            <p
              className={`text-2xl font-medium ${stat.color}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {stat.count}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <Tabs defaultValue="ACTIVE" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/40 p-1">
          {STATUS_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Icon className="size-3.5" />
              {label}
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {grouped[value].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {grouped[value].length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
                <Trophy className="size-12 text-muted-foreground/30 mb-4" />
                <h3
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  No {value.toLowerCase().replace("_", " ")} challenges
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {value === "ACTIVE"
                    ? "No active challenges at the moment. Check back soon."
                    : value === "DRAFT" && isAdmin
                    ? "No draft challenges. Create one to get started."
                    : `No challenges in this status yet.`}
                </p>
                {value === "DRAFT" && isAdmin && (
                  <Link href="/gamification/challenges/new" className="mt-4">
                    <Button size="sm" className="gap-2">
                      <Plus className="size-4" />
                      Create challenge
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[value].map((challenge, i) => {
                  const myParticipation =
                    challenge.participations && challenge.participations.length > 0
                      ? challenge.participations[0]
                      : null;

                  return (
                    <div
                      key={challenge.id}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <ChallengesClientActions
                        challengeId={challenge.id}
                        isAdmin={isAdmin}
                        hasJoined={!!myParticipation}
                        status={challenge.status}
                        title={challenge.title}
                        description={challenge.description}
                        xp={challenge.xp}
                        difficulty={challenge.difficulty}
                        deadline={challenge.deadline}
                        evidenceRequired={challenge.evidenceRequired}
                        participantCount={challenge._count.participations}
                        categoryName={challenge.category.name}
                        myProgress={myParticipation?.progress}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
