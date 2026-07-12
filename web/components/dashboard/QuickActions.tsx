"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Trophy, BarChart3, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    href: "/environmental/carbon",
    icon: Leaf,
    label: "Log Carbon Data",
    description: "Record energy & transport emissions",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    hoverBorder: "hover:border-chart-1/40",
  },
  {
    href: "/gamification/challenges",
    icon: Trophy,
    label: "Start a Challenge",
    description: "Join sustainability challenges for XP",
    color: "text-[--score-gold]",
    bgColor: "bg-[--score-gold]/10",
    hoverBorder: "hover:border-[--score-gold]/40",
  },
  {
    href: "/reports/esg-summary",
    icon: BarChart3,
    label: "View Reports",
    description: "ESG summary and departmental insights",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    hoverBorder: "hover:border-chart-5/40",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div>
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quick Actions
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Shortcuts to common tasks</p>
      </div>
      <div className="space-y-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg border border-border p-3",
                  "transition-all duration-150 hover:bg-accent/40 cursor-pointer",
                  action.hoverBorder
                )}
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    action.bgColor
                  )}
                >
                  <Icon className={cn("size-4", action.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {action.description}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
