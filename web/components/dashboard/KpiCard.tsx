"use client";

import { cn } from "@/lib/utils";
import { getScoreColorClass, getScoreTier } from "@/lib/gamification-utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  delta?: number;       // percentage change vs last period
  subtitle?: string;
  accentColor?: string; // CSS var reference e.g. "var(--chart-1)"
  isScore?: boolean;    // if true, apply score color tier
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit,
  delta,
  subtitle,
  accentColor,
  isScore,
  className,
}: KpiCardProps) {
  const numericValue = typeof value === "number" ? value : parseFloat(String(value));
  const scoreColor = isScore && !isNaN(numericValue) ? getScoreColorClass(numericValue) : "";
  const tier = isScore && !isNaN(numericValue) ? getScoreTier(numericValue) : null;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card overflow-hidden",
        "shadow-[0_1px_0_0_oklch(1_0_0/6%)] transition-all duration-200",
        "hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        style={{
          backgroundImage: accentColor
            ? `linear-gradient(to right, transparent, ${accentColor}80, transparent)`
            : "linear-gradient(to right, transparent, var(--primary) / 60%, transparent)",
        }}
      />

      <div className="p-5">
        {/* Label */}
        <p className="text-xs text-muted-foreground font-medium tracking-wide">
          {title}
        </p>

        {/* Value */}
        <div className="flex items-end gap-1.5 mt-2">
          <span
            className={cn(
              "text-3xl font-medium leading-none",
              scoreColor || "text-foreground"
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {typeof value === "number" ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground mb-0.5">{unit}</span>
          )}
        </div>

        {/* Tier badge for score cards */}
        {tier && (
          <span className={cn("text-xs font-medium mt-1 block", scoreColor)}>
            {tier}
          </span>
        )}

        {/* Delta */}
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              delta > 0
                ? "text-chart-1"
                : delta < 0
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {delta > 0 ? (
              <TrendingUp className="size-3" />
            ) : delta < 0 ? (
              <TrendingDown className="size-3" />
            ) : (
              <Minus className="size-3" />
            )}
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}% vs last period
          </div>
        )}

        {/* Subtitle */}
        {subtitle && !tier && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
