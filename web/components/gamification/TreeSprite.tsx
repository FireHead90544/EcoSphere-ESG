"use client";

import { cn } from "@/lib/utils";
import type { TreeStage } from "@/lib/generated/prisma/client";

interface TreeSpriteProps {
  stage: TreeStage;
  species: string;
  carePoints: number;
  onClick?: () => void;
  isSelected?: boolean;
}

/**
 * Pure CSS tree sprite representing each growth stage.
 * Species variants: Oak (rounded crown), Pine (triangular).
 * MATURE trees glow in dark mode.
 */
export function TreeSprite({
  stage,
  species,
  carePoints,
  onClick,
  isSelected,
}: TreeSpriteProps) {
  const isPine = species.toLowerCase().includes("pine");
  const isMature = stage === "MATURE";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
        "hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80",
        isSelected && "bg-primary/10 ring-1 ring-primary/30"
      )}
      aria-label={`${species} tree — ${stage.toLowerCase()} stage`}
    >
      {/* Tree visual */}
      <div className="relative flex flex-col items-center">
        {/* Glow for MATURE in dark mode */}
        {isMature && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-0 dark:opacity-40 pointer-events-none"
            style={{ background: "var(--esg-env)", transform: "scale(0.8)" }}
          />
        )}

        {/* Tree by stage */}
        {stage === "SEED" && <SeedSprite />}
        {stage === "SAPLING" && <SaplingSprite isPine={isPine} />}
        {stage === "YOUNG" && <YoungSprite isPine={isPine} />}
        {stage === "MATURE" && <MatureSprite isPine={isPine} />}
      </div>

      {/* Label */}
      <span className="text-[10px] text-muted-foreground font-medium capitalize">
        {stage.toLowerCase()}
      </span>
      <span
        className="text-[9px] text-muted-foreground/60"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {carePoints} pts
      </span>
    </button>
  );
}

// ─── Stage sub-components ─────────────────────────────────────────────────────

function SeedSprite() {
  return (
    <div className="flex flex-col items-center" style={{ height: 60 }}>
      {/* Small green sprout */}
      <div className="relative mt-auto">
        {/* Sprout stem */}
        <div
          className="w-0.5 bg-[--esg-env] mx-auto"
          style={{ height: 12 }}
        />
        {/* Leaf */}
        <div
          className="absolute -top-1 left-0 w-3 h-3 rounded-full bg-[--esg-env] opacity-90"
          style={{ transform: "translateX(-4px)" }}
        />
        {/* Soil mound */}
        <div
          className="w-8 h-2.5 rounded-full bg-[--score-bronze]/60 mt-0.5"
          style={{ opacity: 0.6 }}
        />
      </div>
    </div>
  );
}

function SaplingSprite({ isPine }: { isPine: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ height: 60 }}>
      {/* Canopy */}
      {isPine ? (
        <div
          className="w-6 h-8 bg-[--esg-env] opacity-80"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-[--esg-env] opacity-80" />
      )}
      {/* Trunk */}
      <div className="w-1 bg-[--score-bronze] mt-1" style={{ height: 14 }} />
    </div>
  );
}

function YoungSprite({ isPine }: { isPine: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ height: 60 }}>
      {isPine ? (
        <>
          <div
            className="w-8 h-10 bg-[--esg-env]"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
          <div
            className="w-10 h-6 bg-[--esg-env] opacity-80 -mt-3"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
        </>
      ) : (
        <div className="w-10 h-10 rounded-full bg-[--esg-env]" />
      )}
      {/* Trunk */}
      <div className="w-1.5 bg-[--score-bronze]" style={{ height: 16 }} />
    </div>
  );
}

function MatureSprite({ isPine }: { isPine: boolean }) {
  return (
    <div
      className="flex flex-col items-center animate-[sway_4s_ease-in-out_infinite]"
      style={{ height: 70 }}
    >
      {isPine ? (
        <>
          <div
            className="w-8 h-10 bg-[--esg-env]"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
          <div
            className="w-12 h-8 bg-[--esg-env] -mt-4"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              filter: "brightness(0.9)",
            }}
          />
          <div
            className="w-14 h-7 bg-[--esg-env] -mt-3"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              filter: "brightness(0.8)",
            }}
          />
        </>
      ) : (
        <>
          {/* Double-layer oak crown for mature */}
          <div
            className="w-14 h-10 rounded-full bg-[--esg-env]"
            style={{ filter: "brightness(1.05)" }}
          />
          <div
            className="w-10 h-6 rounded-full bg-[--esg-env] -mt-3"
            style={{ filter: "brightness(0.9)" }}
          />
        </>
      )}
      {/* Wide trunk */}
      <div className="w-2 bg-[--score-bronze]" style={{ height: 18 }} />
    </div>
  );
}
