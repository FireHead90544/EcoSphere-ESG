"use client";

import { cn } from "@/lib/utils";
import {
  Leaf,
  Trophy,
  Shield,
  AlertTriangle,
  Medal,
  Users,
  type LucideIcon,
} from "lucide-react";

type ActivityType =
  | "CSR_APPROVAL"
  | "CHALLENGE_COMPLETION"
  | "BADGE_UNLOCK"
  | "COMPLIANCE_ISSUE"
  | "TRAINING_COMPLETE"
  | "GOAL_UPDATE";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  actor?: string;
}

const TYPE_CONFIG: Record<
  ActivityType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  CSR_APPROVAL: {
    icon: Leaf,
    color: "text-chart-2",
    bgColor: "bg-chart-2/15",
  },
  CHALLENGE_COMPLETION: {
    icon: Trophy,
    color: "text-[--score-gold]",
    bgColor: "bg-[--score-gold]/10",
  },
  BADGE_UNLOCK: {
    icon: Medal,
    color: "text-[--score-silver]",
    bgColor: "bg-[--score-silver]/10",
  },
  COMPLIANCE_ISSUE: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/15",
  },
  TRAINING_COMPLETE: {
    icon: Users,
    color: "text-chart-5",
    bgColor: "bg-chart-5/15",
  },
  GOAL_UPDATE: {
    icon: Shield,
    color: "text-chart-1",
    bgColor: "bg-chart-1/15",
  },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center justify-center h-full min-h-[200px]">
        <Users className="size-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-1">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="pb-2">
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Recent Activity
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Live ESG events across the platform</p>
      </div>
      <div className="space-y-0.5 max-h-[260px] overflow-y-auto pr-1">
        {activities.map((activity, i) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/40",
                "animate-in fade-in slide-in-from-left-2 duration-300"
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                  config.bgColor
                )}
              >
                <Icon className={cn("size-3.5", config.color)} />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight line-clamp-1">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                )}
              </div>
              {/* Time */}
              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
