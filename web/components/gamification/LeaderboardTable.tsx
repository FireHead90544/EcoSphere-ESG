"use client";

import { cn } from "@/lib/utils";
import { getScoreTier, getTierColorClass } from "@/lib/gamification-utils";
import { Trophy, Medal, TreePine } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  department: string;
  score: number;
  scoreLabel: string;
  level?: number;
  badgeCount?: number;
  treeCount?: number;
  matureTrees?: number;
  isCurrentUser: boolean;
}

const RANK_ICONS = [
  <Trophy key={1} className="size-4 text-[--score-gold]" />,
  <Medal key={2} className="size-4 text-[--score-silver]" />,
  <Medal key={3} className="size-4 text-[--score-bronze]" />,
];

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-14 text-center">
        <Trophy className="size-10 text-muted-foreground/30 mb-3" />
        <p
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          No entries yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete challenges and CSR activities to earn XP and appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Rank</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Employee</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground text-right">Score</span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground text-right">Tier</span>
      </div>

      <div className="divide-y divide-border/50">
        {rows.map((row, i) => {
          const tier = getScoreTier(row.score);
          const tierColor = getTierColorClass(tier);

          return (
            <div
              key={row.id}
              className={cn(
                "grid grid-cols-[3rem_1fr_auto_auto] gap-4 px-4 py-3 items-center transition-colors",
                "hover:bg-accent/40",
                row.isCurrentUser &&
                  "bg-primary/10 border-l-2 border-primary hover:bg-primary/15",
                i % 2 !== 0 && !row.isCurrentUser && "bg-muted/10"
              )}
              style={{
                animationDelay: `${i * 50}ms`,
              }}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {row.rank <= 3 ? (
                  RANK_ICONS[row.rank - 1]
                ) : (
                  <span
                    className="text-sm font-medium text-muted-foreground"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {row.rank}
                  </span>
                )}
              </div>

              {/* Name + dept */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {row.name}
                    {row.isCurrentUser && (
                      <span className="ml-1.5 text-xs text-primary font-normal">(you)</span>
                    )}
                  </p>
                  {row.level && (
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono text-muted-foreground">
                      Lv.{row.level}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground">{row.department}</p>
                  {row.badgeCount !== undefined && row.badgeCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {row.badgeCount} badge{row.badgeCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {row.treeCount !== undefined && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      · <TreePine className="size-3" /> {row.treeCount}
                      {row.matureTrees ? ` (${row.matureTrees} mature)` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <span
                  className="text-base font-medium text-foreground"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {row.score.toLocaleString()}
                </span>
                <p className="text-[10px] text-muted-foreground">{row.scoreLabel}</p>
              </div>

              {/* Tier badge */}
              <div className="text-right">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs border font-semibold",
                    tierColor,
                    "border-current/30 bg-current/10"
                  )}
                >
                  {tier}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
