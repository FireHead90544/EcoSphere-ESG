"use client";

// Goal Progress Bar — animated, color-transitions by progress level
// green < 70% → amber 70-90% → red > 90%

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  currentCO2: number;
  targetCO2: number;
  className?: string;
}

export function GoalProgressBar({ currentCO2, targetCO2, className }: Props) {
  const pct = targetCO2 > 0 ? Math.min((currentCO2 / targetCO2) * 100, 100) : 0;
  const rounded = Math.round(pct);

  const barColor =
    pct > 90
      ? "bg-destructive"
      : pct > 70
        ? "bg-[--chart-4]"   // amber from design system
        : "bg-[--esg-env]";  // emerald

  const trackColor =
    pct > 90
      ? "bg-destructive/20"
      : pct > 70
        ? "bg-[--chart-4]/20"
        : "bg-[--esg-env]/15";

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("relative h-2 w-full rounded-full overflow-hidden", trackColor)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <span>{currentCO2.toFixed(1)} kg CO₂</span>
        <span className={cn("font-medium", pct > 90 ? "text-destructive" : pct > 70 ? "text-[--chart-4]" : "text-[--esg-env]")}>
          {rounded}% of {targetCO2.toFixed(0)} kg target
        </span>
      </div>
    </div>
  );
}
