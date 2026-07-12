/**
 * EcoSphere Gamification Utilities
 * Pure functions — no Prisma, no server-only imports. Safe to use anywhere.
 */

import type { TreeStage } from "@/lib/generated/prisma/client";

// ─── XP & Level ──────────────────────────────────────────────────────────────

/**
 * Compute level from total XP.
 * Formula: level = floor(1 + sqrt(xp / 50))
 * Thresholds: L2@50xp, L3@200xp, L4@450xp, L5@800xp, L6@1250xp
 */
export function calcLevel(xp: number): number {
  return Math.floor(1 + Math.sqrt(Math.max(0, xp) / 50));
}

/**
 * XP required to reach a given level.
 * Inverse of calcLevel: xp = (level - 1)^2 * 50
 */
export function xpForLevel(level: number): number {
  return Math.pow(Math.max(1, level) - 1, 2) * 50;
}

/**
 * XP progress within the current level (0–1 fraction).
 */
export function levelProgress(xp: number): number {
  const currentLevel = calcLevel(xp);
  const currentFloor = xpForLevel(currentLevel);
  const nextFloor = xpForLevel(currentLevel + 1);
  if (nextFloor === currentFloor) return 1;
  return Math.min(1, (xp - currentFloor) / (nextFloor - currentFloor));
}

// ─── Garden / Water Decay ─────────────────────────────────────────────────────

/**
 * Compute the effective water level at the current moment.
 * Decays ~5 units per day since last watered. Computed on read — no cron needed.
 */
export function computeWaterLevel(
  storedLevel: number,
  lastWatered: Date
): number {
  const daysSince =
    (Date.now() - new Date(lastWatered).getTime()) / 86_400_000;
  return Math.max(0, Math.round(storedLevel - daysSince * 5));
}

// ─── Tree Stage ───────────────────────────────────────────────────────────────

/** Point value of each tree stage for garden growthScore calculation. */
export const TREE_STAGE_VALUES: Record<TreeStage, number> = {
  SEED: 1,
  SAPLING: 3,
  YOUNG: 7,
  MATURE: 15,
};

/** Care points required to reach each stage (cumulative from SEED). */
export const STAGE_THRESHOLDS: Record<TreeStage, number> = {
  SEED: 0,
  SAPLING: 20,
  YOUNG: 50,
  MATURE: 100,
};

/**
 * Determine the tree stage from accumulated care points.
 */
export function carePointsToStage(carePoints: number): TreeStage {
  if (carePoints >= STAGE_THRESHOLDS.MATURE) return "MATURE";
  if (carePoints >= STAGE_THRESHOLDS.YOUNG) return "YOUNG";
  if (carePoints >= STAGE_THRESHOLDS.SAPLING) return "SAPLING";
  return "SEED";
}

/**
 * Progress toward the next stage (0–1 fraction). Returns 1 for MATURE trees.
 */
export function stageProgress(carePoints: number): number {
  const stage = carePointsToStage(carePoints);
  if (stage === "MATURE") return 1;

  const stages: TreeStage[] = ["SEED", "SAPLING", "YOUNG", "MATURE"];
  const nextStage = stages[stages.indexOf(stage) + 1];
  const floor = STAGE_THRESHOLDS[stage];
  const ceiling = STAGE_THRESHOLDS[nextStage];
  return Math.min(1, (carePoints - floor) / (ceiling - floor));
}

/**
 * Compute total growthScore for a garden from all its trees.
 */
export function computeGrowthScore(
  trees: { stage: TreeStage }[]
): number {
  return trees.reduce((sum, t) => sum + TREE_STAGE_VALUES[t.stage], 0);
}

// ─── ESG Score Tiers ──────────────────────────────────────────────────────────

export type ScoreTier =
  | "Trailblazer"
  | "Leader"
  | "Achiever"
  | "Developing"
  | "At Risk";

/**
 * Human-readable tier label for an ESG or garden score.
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 90) return "Trailblazer";
  if (score >= 75) return "Leader";
  if (score >= 60) return "Achiever";
  if (score >= 45) return "Developing";
  return "At Risk";
}

/**
 * Tailwind text-color class for a score (references design token variables).
 */
export function getScoreColorClass(score: number): string {
  if (score >= 80) return "text-chart-1";     // emerald — excellent
  if (score >= 60) return "text-chart-3";     // amber — good
  if (score >= 40) return "text-chart-4";     // orange — needs work
  return "text-destructive";                   // red — critical
}

/**
 * Stroke color (CSS value) for the ESG score ring SVG.
 */
export function getScoreStrokeColor(score: number): string {
  if (score >= 80) return "var(--chart-1)";
  if (score >= 60) return "var(--chart-3)";
  if (score >= 40) return "var(--chart-4)";
  return "var(--destructive)";
}

/**
 * Tailwind text-color class for the score tier medal.
 */
export function getTierColorClass(tier: ScoreTier): string {
  switch (tier) {
    case "Trailblazer":
    case "Leader":
      return "text-[--score-gold]";
    case "Achiever":
      return "text-[--score-silver]";
    case "Developing":
      return "text-[--score-bronze]";
    case "At Risk":
      return "text-[--score-critical]";
  }
}

// ─── Badge Rules ──────────────────────────────────────────────────────────────

export type BadgeUnlockRule =
  | { type: "XP_THRESHOLD"; value: number }
  | { type: "CHALLENGE_COUNT"; value: number }
  | { type: "CSR_COUNT"; value: number };

/**
 * Parse the JSON unlock rule stored in Badge.unlockRule.
 * Returns null if malformed (defensive).
 */
export function parseBadgeRule(json: string): BadgeUnlockRule | null {
  try {
    const rule = JSON.parse(json) as BadgeUnlockRule;
    if (!rule.type || rule.value === undefined) return null;
    return rule;
  } catch {
    return null;
  }
}

/**
 * Human-readable description of a badge unlock rule.
 */
export function badgeRuleDescription(rule: BadgeUnlockRule): string {
  switch (rule.type) {
    case "XP_THRESHOLD":
      return `Earn ${rule.value} XP`;
    case "CHALLENGE_COUNT":
      return `Complete ${rule.value} challenge${rule.value !== 1 ? "s" : ""}`;
    case "CSR_COUNT":
      return `Join ${rule.value} CSR activit${rule.value !== 1 ? "ies" : "y"}`;
  }
}

/**
 * Check whether an employee satisfies a badge unlock rule.
 */
export function checkBadgeRule(
  rule: BadgeUnlockRule,
  stats: { xp: number; challengesCompleted: number; csrCompleted: number }
): boolean {
  switch (rule.type) {
    case "XP_THRESHOLD":
      return stats.xp >= rule.value;
    case "CHALLENGE_COUNT":
      return stats.challengesCompleted >= rule.value;
    case "CSR_COUNT":
      return stats.csrCompleted >= rule.value;
  }
}

// ─── Misc Formatting ──────────────────────────────────────────────────────────

/**
 * Format a CO₂ value with appropriate unit (kg vs t).
 */
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tCO₂e`;
  return `${kg.toFixed(1)} kgCO₂e`;
}

/**
 * Days remaining until a deadline. Negative = overdue.
 */
export function daysUntil(date: Date): number {
  return Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
}

/**
 * Difficulty badge colors (Tailwind classes).
 */
export const DIFFICULTY_STYLES = {
  EASY: {
    label: "Easy",
    bg: "bg-chart-2/15",
    text: "text-chart-2",
    border: "border-chart-2/25",
  },
  MEDIUM: {
    label: "Medium",
    bg: "bg-chart-3/15",
    text: "text-chart-3",
    border: "border-chart-3/25",
  },
  HARD: {
    label: "Hard",
    bg: "bg-destructive/15",
    text: "text-destructive",
    border: "border-destructive/25",
  },
} as const;
