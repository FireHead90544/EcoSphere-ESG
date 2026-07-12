"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  iconSlot: React.ReactNode;   // Pre-rendered icon from server component (no fn refs)
  color: string;
  bg: string;
  border: string;
  featured?: boolean;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const stepCount = duration / 16;
    const step = target / stepCount;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export function ScoreCard({ label, value, iconSlot, color, bg, border, featured }: Props) {
  const display = useCountUp(value);

  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 overflow-hidden transition-all hover:shadow-lg",
        border,
        featured ? "bg-gradient-to-br from-primary/10 via-card to-card" : "bg-card"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute -right-4 -top-4 size-24 rounded-full opacity-10 blur-xl bg-primary" />

      {/* Icon */}
      <div className={cn("flex size-9 items-center justify-center rounded-lg mb-3", bg)}>
        {iconSlot}
      </div>

      {/* Score */}
      <div className="flex items-end gap-2 mb-1">
        <span className={cn("text-3xl font-bold font-mono", featured ? "text-primary" : "text-foreground")}>
          {display}
        </span>
        <span className="text-xs text-muted-foreground mb-1.5">/100</span>
      </div>

      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-full bg-muted/30">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", featured ? "bg-primary" : bg.replace("/10", "/60"))}
          style={{ width: `${display}%` }}
        />
      </div>

      {/* Status label */}
      <p className={cn(
        "mt-1.5 text-[10px] font-medium",
        value >= 75 ? "text-[--esg-env]" : value >= 50 ? "text-[--esg-gov]" : "text-destructive"
      )}>
        {value >= 75 ? "On Track" : value >= 50 ? "Needs Attention" : "Critical"}
      </p>
    </div>
  );
}
