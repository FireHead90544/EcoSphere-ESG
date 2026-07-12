"use client";

import {
  Leaf,
  Trophy,
  Users,
  CloudOff,
  Star,
  Shield,
  Flame,
  Heart,
  Zap,
  TreePine,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeRuleDescription, parseBadgeRule } from "@/lib/gamification-utils";

// Map stored icon name strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  Trophy,
  Users,
  CloudOff,
  Star,
  Shield,
  Flame,
  Heart,
  Zap,
  TreePine,
};

interface BadgeCardProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockRule: string;
    unlockedAt?: Date | null;
  };
  isUnlocked: boolean;
}

export function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  const Icon = ICON_MAP[badge.icon] ?? Star;
  const rule = parseBadgeRule(badge.unlockRule);
  const ruleText = rule ? badgeRuleDescription(rule) : "Special achievement";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 text-center space-y-3 relative overflow-hidden",
        "transition-all duration-200 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUnlocked
          ? "border-[--score-gold]/25"
          : "border-border opacity-50"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--score-gold]/40 to-transparent" />

      {/* Badge circle */}
      <div className="flex justify-center">
        <div
          className={cn(
            "relative flex size-16 items-center justify-center rounded-full",
            isUnlocked
              ? "bg-[--score-gold]/15 shadow-[0_0_0_2px_oklch(0.82_0.18_85/30%)]"
              : "bg-muted"
          )}
        >
          {isUnlocked ? (
            <Icon className="size-7 text-[--score-gold]" />
          ) : (
            <Lock className="size-6 text-muted-foreground/50" />
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-0.5">
        <h3
          className={cn(
            "text-sm font-semibold leading-tight",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {badge.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {badge.description}
        </p>
      </div>

      {/* Unlock rule */}
      <div
        className={cn(
          "rounded-md px-2 py-1 text-xs",
          isUnlocked
            ? "bg-[--score-gold]/10 text-[--score-gold]"
            : "bg-muted/50 text-muted-foreground"
        )}
      >
        {isUnlocked ? "✓ " : ""}
        {ruleText}
      </div>

      {/* Unlocked date */}
      {isUnlocked && badge.unlockedAt && (
        <p className="text-[10px] text-muted-foreground">
          Unlocked{" "}
          {new Date(badge.unlockedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
