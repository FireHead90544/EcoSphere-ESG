import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllBadgesWithStatus } from "@/lib/actions/gamification";
import { BadgeCard } from "@/components/gamification/BadgeCard";
import { Medal, Lock } from "lucide-react";

export const metadata = {
  title: "Badges — EcoSphere",
  description: "Achievement badges earned through XP and challenge completion",
};

export default async function BadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const badges = await getAllBadgesWithStatus();
  const earned = badges.filter((b) => b.isUnlocked);
  const locked = badges.filter((b) => !b.isUnlocked);

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Badges
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Achievements earned through XP, challenges, and CSR participation.
        </p>
      </div>

      {/* Earned */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Medal className="size-4 text-[--score-gold]" />
          <h2
            className="text-sm font-semibold text-foreground uppercase tracking-widest"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Earned ({earned.length})
          </h2>
        </div>
        {earned.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No badges earned yet. Complete challenges and CSR activities to unlock your first badge.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {earned.map((badge, i) => (
              <div key={badge.id} style={{ animationDelay: `${i * 50}ms` }}>
                <BadgeCard badge={badge} isUnlocked={true} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Locked */}
      {locked.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <h2
              className="text-sm font-semibold text-muted-foreground uppercase tracking-widest"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Locked ({locked.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {locked.map((badge, i) => (
              <div key={badge.id} style={{ animationDelay: `${i * 50}ms` }}>
                <BadgeCard badge={badge} isUnlocked={false} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
