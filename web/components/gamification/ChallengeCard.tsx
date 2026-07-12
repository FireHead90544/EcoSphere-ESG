"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DIFFICULTY_STYLES,
  daysUntil,
} from "@/lib/gamification-utils";
import type { Difficulty, ChallengeStatus } from "@/lib/generated/prisma/client";
import {
  Star,
  Clock,
  Users,
  Shield,
  Trophy,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  ChallengeStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-muted/50 text-muted-foreground border-border",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-chart-1/15 text-chart-1 border-chart-1/25",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-chart-5/15 text-chart-5 border-chart-5/25",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted/30 text-muted-foreground border-border",
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: Difficulty;
  status: ChallengeStatus;
  deadline: Date;
  evidenceRequired: boolean;
  participantCount: number;
  categoryName: string;
  /** If the current user has joined, provide their progress (0–100) */
  myProgress?: number;
  /** Whether the current user is admin */
  isAdmin?: boolean;
  /** Called when "Join Challenge" is clicked (mutation handled by parent) */
  onJoin?: (id: string) => void;
  /** Whether join is in progress (optimistic loading) */
  isJoining?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChallengeCard({
  id,
  title,
  description,
  xp,
  difficulty,
  status,
  deadline,
  evidenceRequired,
  participantCount,
  categoryName,
  myProgress,
  isAdmin,
  onJoin,
  isJoining,
}: ChallengeCardProps) {
  const diff = DIFFICULTY_STYLES[difficulty];
  const statusStyle = STATUS_STYLES[status];
  const days = daysUntil(deadline);
  const hasJoined = myProgress !== undefined;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border transition-all duration-200",
        "hover:shadow-md hover:border-border/80",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      {/* Top accent gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <CardHeader className="pb-3 pt-5">
        {/* Top row: category + status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">
            {categoryName}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-semibold border", statusStyle.className)}
          >
            {statusStyle.label}
          </Badge>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold text-foreground leading-tight mt-1.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>

        {/* XP + difficulty badges */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 rounded-sm border border-[--score-gold]/30 bg-[--score-gold]/10 px-2 py-0.5 text-xs font-semibold text-[--score-gold]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Star className="size-3" />
            {xp} XP
          </span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-semibold border rounded-sm",
              diff.bg,
              diff.text,
              diff.border
            )}
          >
            {diff.label}
          </Badge>
          {evidenceRequired && (
            <Badge
              variant="outline"
              className="text-xs border-border text-muted-foreground rounded-sm"
            >
              <Shield className="size-3 mr-1" />
              Evidence required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-5 space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3" />
            {participantCount} joined
          </span>
          <span
            className={cn(
              "flex items-center gap-1",
              days < 0
                ? "text-destructive"
                : days <= 3
                ? "text-chart-4"
                : ""
            )}
          >
            <Clock className="size-3" />
            {days < 0
              ? `${Math.abs(days)}d overdue`
              : days === 0
              ? "Due today"
              : `${days}d left`}
          </span>
        </div>

        {/* Progress bar if joined */}
        {hasJoined && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Your progress</span>
              <span
                className="font-mono text-foreground"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {myProgress}%
              </span>
            </div>
            <Progress
              value={myProgress}
              className="h-1.5 bg-muted"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link href={`/gamification/challenges/${id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              View details
              <ChevronRight className="size-3.5" />
            </Button>
          </Link>

          {status === "ACTIVE" && !hasJoined && !isAdmin && (
            <Button
              size="sm"
              onClick={() => onJoin?.(id)}
              disabled={isJoining}
              className="flex-1 transition-shadow hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)]"
            >
              {isJoining ? (
                <>
                  <Trophy className="size-3.5 mr-1.5 animate-spin" />
                  Joining…
                </>
              ) : (
                <>
                  <Trophy className="size-3.5 mr-1.5" />
                  Join Challenge
                </>
              )}
            </Button>
          )}

          {hasJoined && (
            <Badge
              variant="outline"
              className="text-xs border-chart-1/30 text-chart-1 bg-chart-1/10"
            >
              Joined ✓
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
