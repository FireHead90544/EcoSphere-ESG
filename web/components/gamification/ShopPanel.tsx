"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buyShopItem, plantTree } from "@/lib/actions/garden";
import { toast } from "sonner";
import {
  Droplets,
  Sprout,
  FlaskConical,
  Sparkles,
  Coins,
  Package,
} from "lucide-react";
import type { ShopItem, ShopItemType } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const ITEM_TYPE_CONFIG: Record<
  ShopItemType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  WATER: { icon: Droplets, color: "text-chart-2", bgColor: "bg-chart-2/15" },
  SEED: { icon: Sprout, color: "text-chart-1", bgColor: "bg-chart-1/15" },
  FERTILIZER: { icon: FlaskConical, color: "text-chart-3", bgColor: "bg-chart-3/15" },
  DECORATION: { icon: Sparkles, color: "text-chart-5", bgColor: "bg-chart-5/15" },
};

interface ShopPanelProps {
  items: ShopItem[];
  coinBalance: number;
  inventory: { shopItemId: string; quantity: number }[];
}

export function ShopPanel({ items, coinBalance, inventory }: ShopPanelProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const inventoryMap = new Map(inventory.map((i) => [i.shopItemId, i.quantity]));

  function getQty(itemId: string) {
    return quantities[itemId] ?? 1;
  }

  function handleBuy(item: ShopItem) {
    const qty = getQty(item.id);
    startTransition(async () => {
      const result = await buyShopItem({ shopItemId: item.id, quantity: qty });
      if (result.success) {
        toast.success("Purchase complete", {
          description: `${qty}× ${item.name} added to inventory. New balance: ${result.data.newCoinBalance} coins.`,
        });
      } else {
        toast.error("Purchase failed", { description: result.error });
      }
    });
  }

  function handlePlant(item: ShopItem) {
    startTransition(async () => {
      const result = await plantTree({ seedShopItemId: item.id });
      if (result.success) {
        toast.success("Tree planted!", {
          description: "Your seed is in the ground. Water it to help it grow.",
        });
      } else {
        toast.error("Could not plant", { description: result.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Coin balance */}
      <div className="flex items-center justify-between rounded-lg border border-[--score-gold]/25 bg-[--score-gold]/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Coins className="size-4 text-[--score-gold]" />
          <span className="text-sm font-medium text-foreground">Your EcoCoin balance</span>
        </div>
        <span
          className="text-xl font-medium text-[--score-gold]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {coinBalance}
        </span>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const typeConfig = ITEM_TYPE_CONFIG[item.type];
          const Icon = typeConfig.icon;
          const qty = getQty(item.id);
          const totalCost = item.costCoins * qty;
          const canAfford = coinBalance >= totalCost;
          const inInventory = inventoryMap.get(item.id) ?? 0;
          const outOfStock = item.stock !== null && item.stock <= 0;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border border-border bg-card p-4 space-y-3 relative overflow-hidden",
                "transition-all duration-200",
                outOfStock && "opacity-60"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* Header */}
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    typeConfig.bgColor
                  )}
                >
                  <Icon className={cn("size-4", typeConfig.color)} />
                </div>
                {outOfStock && (
                  <Badge
                    variant="outline"
                    className="text-xs border-destructive/30 text-destructive"
                  >
                    Out of stock
                  </Badge>
                )}
                {!outOfStock && item.stock !== null && item.stock <= 10 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-chart-4/30 text-chart-4"
                  >
                    {item.stock} left
                  </Badge>
                )}
              </div>

              {/* Name + description */}
              <div>
                <h4
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.type === "WATER" && "Waters a tree, adding +10 care points"}
                  {item.type === "SEED" && "Plant in your garden to grow a new tree"}
                  {item.type === "FERTILIZER" && "Boosts growth with +20 care points"}
                  {item.type === "DECORATION" && "Decorates your garden"}
                </p>
              </div>

              {/* Inventory badge */}
              {inInventory > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="size-3" />
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {inInventory} in inventory
                  </span>
                </div>
              )}

              {/* Price + quantity + buy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-base font-medium text-[--score-gold]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.costCoins} coins
                  </span>
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setQuantities((q) => ({
                          ...q,
                          [item.id]: Math.max(1, (q[item.id] ?? 1) - 1),
                        }))
                      }
                      className="size-6 rounded border border-border text-xs hover:bg-accent flex items-center justify-center"
                    >
                      −
                    </button>
                    <span
                      className="w-6 text-center text-sm"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() =>
                        setQuantities((q) => ({
                          ...q,
                          [item.id]: Math.min(99, (q[item.id] ?? 1) + 1),
                        }))
                      }
                      className="size-6 rounded border border-border text-xs hover:bg-accent flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 transition-shadow hover:shadow-[0_0_12px_oklch(0.72_0.19_162/25%)]"
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || outOfStock || isPending}
                  >
                    Buy {qty > 1 ? `${qty}×` : ""} — {totalCost} coins
                  </Button>
                  {item.type === "SEED" && inInventory > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handlePlant(item)}
                      disabled={isPending}
                    >
                      <Sprout className="size-3.5" />
                      Plant
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
