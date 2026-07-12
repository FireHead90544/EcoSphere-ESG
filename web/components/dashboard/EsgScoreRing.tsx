"use client";

import { useEffect, useRef } from "react";
import { getScoreStrokeColor, getScoreTier } from "@/lib/gamification-utils";
import { cn } from "@/lib/utils";

interface EsgScoreRingProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function EsgScoreRing({
  score,
  label,
  size = 120,
  strokeWidth = 8,
  className,
}: EsgScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;
  const strokeColor = getScoreStrokeColor(clampedScore);
  const tier = getScoreTier(clampedScore);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;

    // Animate from full offset (0%) to target
    el.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1) 300ms";
      el.style.strokeDashoffset = String(offset);
    });

    return () => cancelAnimationFrame(raf);
  }, [circumference, offset]);

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${clampedScore} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(1 0 0 / 10%)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference} // starts at 0, animated by useEffect
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-medium leading-none"
            style={{
              fontFamily: "var(--font-mono)",
              color: strokeColor,
            }}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p
          className="text-[10px] text-muted-foreground"
          style={{ color: strokeColor }}
        >
          {tier}
        </p>
      </div>
    </div>
  );
}
