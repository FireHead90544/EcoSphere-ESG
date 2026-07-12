import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getXPLeaderboard, getGardenLeaderboard } from "@/lib/actions/gamification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable } from "@/components/gamification/LeaderboardTable";
import { Star, TreePine } from "lucide-react";

export const metadata = {
  title: "Leaderboard — EcoSphere",
  description: "EcoSphere XP and Garden growth leaderboard",
};

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentEmployee = await (async () => {
    const { prisma } = await import("@/lib/prisma");
    return prisma.employee.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
  })();

  const [xpBoard, gardenBoard] = await Promise.all([
    getXPLeaderboard(),
    getGardenLeaderboard(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Rankings by XP earned and virtual garden growth score.
        </p>
      </div>

      <Tabs defaultValue="xp" className="space-y-4">
        <TabsList>
          <TabsTrigger value="xp" className="gap-2">
            <Star className="size-4 text-[--score-gold]" />
            XP Leaderboard
          </TabsTrigger>
          <TabsTrigger value="garden" className="gap-2">
            <TreePine className="size-4 text-chart-1" />
            Garden Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp">
          <LeaderboardTable
            rows={xpBoard.map((e) => ({
              rank: e.rank,
              id: e.id,
              name: e.name,
              department: e.department,
              score: e.xp,
              scoreLabel: "XP",
              level: e.level,
              badgeCount: e.badgeCount,
              isCurrentUser: e.id === currentEmployee?.id,
            }))}
          />
        </TabsContent>

        <TabsContent value="garden">
          <LeaderboardTable
            rows={gardenBoard.map((g) => ({
              rank: g.rank,
              id: g.employeeId,
              name: g.employeeName,
              department: g.department,
              score: g.growthScore,
              scoreLabel: "Growth",
              treeCount: g.treeCount,
              matureTrees: g.matureTrees,
              isCurrentUser: g.employeeId === currentEmployee?.id,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
