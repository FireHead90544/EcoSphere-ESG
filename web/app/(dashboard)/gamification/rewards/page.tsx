import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRewards } from "@/lib/actions/gamification";
import { prisma } from "@/lib/prisma";
import { RewardCard } from "@/components/gamification/RewardCard";
import { Gift, Star } from "lucide-react";

export const metadata = {
  title: "Rewards — EcoSphere",
  description: "Redeem your XP for rewards from the EcoSphere catalog",
};

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { xp: true, ecoCoins: true },
  });

  const rewards = await getRewards();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Rewards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Redeem your XP for tangible rewards from the catalog.
          </p>
        </div>
        {employee && (
          <div className="rounded-lg border border-[--score-gold]/25 bg-[--score-gold]/5 px-4 py-2.5 text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star className="size-3.5 text-[--score-gold]" />
              <span
                className="text-xl font-medium text-[--score-gold]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {employee.xp}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">XP available</p>
          </div>
        )}
      </div>

      {rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Gift className="size-12 text-muted-foreground/30 mb-4" />
          <h3
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            No rewards available
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Check back soon — new rewards are added regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, i) => (
            <div key={reward.id} style={{ animationDelay: `${i * 50}ms` }}>
              <RewardCard
                reward={{
                  id: reward.id,
                  name: reward.name,
                  description: reward.description,
                  pointsRequired: reward.pointsRequired,
                  stock: reward.stock,
                }}
                currentXP={employee?.xp ?? 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
