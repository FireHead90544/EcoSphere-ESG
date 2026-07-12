"use client";

// Environmental KPI Row — 4 metric cards with count-up animation
// DESIGN.md §6.1: top gradient border, font-mono metrics, trend indicators

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingUp, TrendingDown, Minus, Target, Zap, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnvironmentalKPIs } from "@/lib/actions/environmental/dashboard";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return value;
}

// ─── Individual KPI Card ──────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: number | null;    // percentage change; positive = worse for emissions, better for score
  trendInverse?: boolean;   // if true, positive trend = bad (for CO₂)
  icon: React.ReactNode;
  note?: string;
  accentColor?: string;
  decimals?: number;
  staggerMs?: number;
}

function KpiCard({
  label,
  value,
  unit,
  trend,
  trendInverse = false,
  icon,
  note,
  accentColor = "var(--esg-env)",
  decimals = 1,
  staggerMs = 0,
}: KpiCardProps) {
  const animated = useCountUp(value, 1200);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), staggerMs);
    return () => clearTimeout(t);
  }, [staggerMs]);

  const trendPositive = trend !== null && trend !== undefined && trend > 0;
  const trendIsGood = trendInverse ? !trendPositive : trendPositive;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "animate-in fade-in slide-in-from-bottom-3 duration-500",
        !visible && "opacity-0"
      )}
    >
      {/* Top gradient accent */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${accentColor} 50%, transparent)`,
        }}
      />

      <CardContent className="pt-5 pb-4 px-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-bold text-foreground">
            {animated.toFixed(decimals)}
          </span>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {trend !== null && trend !== undefined ? (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                trendIsGood
                  ? "bg-[--esg-env]/12 text-[--esg-env]"
                  : "bg-destructive/12 text-destructive"
              )}
            >
              {trendPositive ? (
                <TrendingUp className="size-3" />
              ) : trendPositive === false && trend < 0 ? (
                <TrendingDown className="size-3" />
              ) : (
                <Minus className="size-3" />
              )}
              {Math.abs(trend).toFixed(1)}% vs last month
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No prior data</span>
          )}
          {note && (
            <span className="text-[10px] text-muted-foreground italic">{note}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

export function EnvironmentalKpiRow({ kpis }: { kpis: EnvironmentalKPIs }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="CO₂ This Month"
        value={kpis.totalCO2ThisMonth}
        unit="kg"
        trend={kpis.co2TrendPct}
        trendInverse  // rising CO₂ = bad
        icon={<Leaf className="size-4" />}
        decimals={1}
        staggerMs={0}
      />
      <KpiCard
        label="Environmental Score"
        value={kpis.envScore}
        unit="/ 100"
        icon={<Zap className="size-4" />}
        note={kpis.isFallback ? "(rule-based)" : "(ML)"}
        decimals={0}
        staggerMs={80}
      />
      <KpiCard
        label="Goals On Track"
        value={kpis.goalsOnTrack}
        unit={`of ${kpis.totalActiveGoals}`}
        icon={<Target className="size-4" />}
        decimals={0}
        staggerMs={160}
      />
      <KpiCard
        label="Emission Intensity"
        value={kpis.emissionIntensity}
        unit="kg CO₂/emp"
        trend={
          kpis.emissionIntensityLastMonth > 0
            ? ((kpis.emissionIntensity - kpis.emissionIntensityLastMonth) /
                kpis.emissionIntensityLastMonth) *
              100
            : null
        }
        trendInverse
        icon={<Users className="size-4" />}
        decimals={2}
        staggerMs={240}
      />
    </div>
  );
}
