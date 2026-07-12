"use client";

import { useState, useTransition } from "react";
import { TreeSprite } from "@/components/gamification/TreeSprite";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { waterTree, fertilizeTree } from "@/lib/actions/garden";
import { toast } from "sonner";
import { stageProgress, TREE_STAGE_VALUES } from "@/lib/gamification-utils";
import { Droplets, Sprout, FlaskConical, TreePine, TrendingUp } from "lucide-react";
import type { Tree, TreeStage } from "@/lib/generated/prisma/client";

interface GardenViewProps {
  garden: {
    id: string;
    growthScore: number;
    waterLevel: number;
    trees: Tree[];
  };
  ecoCoins: number;
}

export function GardenView({ garden, ecoCoins }: GardenViewProps) {
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedTree = garden.trees.find((t) => t.id === selectedTreeId);
  const waterLevelCapped = Math.min(100, Math.max(0, garden.waterLevel));

  function handleWater() {
    if (!selectedTreeId) return;
    startTransition(async () => {
      const result = await waterTree({ treeId: selectedTreeId });
      if (result.success) {
        toast.success("Tree watered!", {
          description: "Added 10 care points. Keep it up!",
        });
      } else {
        toast.error("Could not water", { description: result.error });
      }
    });
  }

  function handleFertilize() {
    if (!selectedTreeId) return;
    startTransition(async () => {
      const result = await fertilizeTree({ treeId: selectedTreeId });
      if (result.success) {
        toast.success("Fertilizer applied!", {
          description: "Added 20 care points — stage progress boosted.",
        });
      } else {
        toast.error("Could not fertilize", { description: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3" />
            Growth Score
          </p>
          <p
            className="text-2xl font-medium text-[--score-gold]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {garden.growthScore}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TreePine className="size-3" />
            Trees
          </p>
          <p
            className="text-2xl font-medium text-foreground"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {garden.trees.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Droplets className="size-3" />
            Water Level
          </p>
          <div className="space-y-1.5">
            <p
              className="text-2xl font-medium text-chart-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {waterLevelCapped}%
            </p>
            <Progress
              value={waterLevelCapped}
              className="h-1.5"
              style={
                {
                  "--progress-fill": "var(--esg-env)",
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      </div>

      {/* Garden canvas */}
      <div
        className="relative rounded-xl border border-border overflow-hidden"
        style={{ minHeight: 240 }}
      >
        {/* Sky gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.14 0.025 220 / 60%) 0%, oklch(0.18 0.025 220 / 30%) 60%, oklch(0.18 0.03 150 / 20%) 100%)",
          }}
        />
        {/* Grass strip */}
        <div
          className="absolute bottom-0 inset-x-0 h-8 rounded-b-xl"
          style={{ background: "var(--esg-env)", opacity: 0.2 }}
        />

        {/* Empty state */}
        {garden.trees.length === 0 && (
          <div className="relative z-10 flex flex-col items-center justify-center h-full py-12 text-center">
            <Sprout className="size-10 text-muted-foreground/30 mb-3" />
            <p
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your garden is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Buy a seed from the shop and plant it to start your garden.
            </p>
          </div>
        )}

        {/* Trees */}
        {garden.trees.length > 0 && (
          <div className="relative z-10 flex items-end justify-center gap-4 px-6 pb-8 pt-4 min-h-[240px]">
            {garden.trees.map((tree) => (
              <TreeSprite
                key={tree.id}
                stage={tree.stage}
                species={tree.species}
                carePoints={tree.carePoints}
                isSelected={selectedTreeId === tree.id}
                onClick={() =>
                  setSelectedTreeId(
                    selectedTreeId === tree.id ? null : tree.id
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected tree actions panel */}
      {selectedTree && (
        <div
          className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {selectedTree.species} tree
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedTree.stage.toLowerCase()} stage ·{" "}
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {selectedTree.carePoints} care pts
                </span>
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs border-[--score-gold]/30 text-[--score-gold] bg-[--score-gold]/10"
            >
              +{TREE_STAGE_VALUES[selectedTree.stage]} growth pts
            </Badge>
          </div>

          {/* Stage progress */}
          {selectedTree.stage !== "MATURE" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Stage progress</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {Math.round(stageProgress(selectedTree.carePoints) * 100)}%
                </span>
              </div>
              <Progress
                value={stageProgress(selectedTree.carePoints) * 100}
                className="h-1.5 bg-muted"
              />
              <p className="text-[10px] text-muted-foreground">
                Next stage:{" "}
                {
                  (["SEED", "SAPLING", "YOUNG", "MATURE"] as TreeStage[])[
                    (["SEED", "SAPLING", "YOUNG", "MATURE"] as TreeStage[]).indexOf(
                      selectedTree.stage
                    ) + 1
                  ]
                }
              </p>
            </div>
          )}
          {selectedTree.stage === "MATURE" && (
            <p className="text-xs text-chart-1 font-medium">
              ✓ Fully grown — maximum growth points earned
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleWater}
              disabled={isPending}
              className="gap-1.5 border-chart-2/30 text-chart-2 hover:bg-chart-2/10"
            >
              <Droplets className="size-3.5" />
              Water (+10 pts)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFertilize}
              disabled={isPending}
              className="gap-1.5 border-chart-3/30 text-chart-3 hover:bg-chart-3/10"
            >
              <FlaskConical className="size-3.5" />
              Fertilize (+20 pts)
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Watering uses 1 Water Can · Fertilizing uses 1 Fertilizer from your inventory
          </p>
        </div>
      )}
    </div>
  );
}
