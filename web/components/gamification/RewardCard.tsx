"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { redeemReward } from "@/lib/actions/gamification";
import { toast } from "sonner";
import { Gift, Star, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: {
    id: string;
    name: string;
    description: string;
    pointsRequired: number;
    stock: number;
  };
  currentXP: number;
}

export function RewardCard({ reward, currentXP }: RewardCardProps) {
  const [isPending, startTransition] = useTransition();
  const canAfford = currentXP >= reward.pointsRequired;
  const outOfStock = reward.stock !== null && reward.stock !== -1 && reward.stock <= 0;
  const isUnlimited = reward.stock === null || reward.stock === -1;

  function handleRedeem() {
    startTransition(async () => {
      const result = await redeemReward({ rewardId: reward.id });
      if (result.success) {
        toast.success("Reward redeemed!", {
          description: `${reward.name} is on its way. Remaining XP: ${result.data.newXP}`,
        });
      } else {
        toast.error("Redemption failed", { description: result.error });
      }
    });
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border transition-all duration-200",
        "animate-in fade-in slide-in-from-bottom-2 duration-300",
        "hover:shadow-md",
        outOfStock && "opacity-60"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--score-gold]/40 to-transparent" />

      <CardHeader className="pb-3 pt-5">
        {/* Icon */}
        <div className="flex size-11 items-center justify-center rounded-xl bg-[--score-gold]/10 border border-[--score-gold]/25 mb-2">
          <Gift className="size-5 text-[--score-gold]" />
        </div>
        <h3
          className="text-base font-semibold text-foreground leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {reward.name}
        </h3>
      </CardHeader>

      <CardContent className="space-y-3 pb-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {reward.description}
        </p>

        {/* XP cost + stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-[--score-gold]" />
            <span
              className="text-base font-medium text-[--score-gold]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {reward.pointsRequired} XP
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="size-3" />
            {outOfStock
              ? "Out of stock"
              : isUnlimited
              ? "Unlimited"
              : `${reward.stock} left`}
          </div>
        </div>

        {/* Redeem button with confirmation */}
        {outOfStock ? (
          <Button size="sm" disabled className="w-full">
            Out of stock
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  size="sm"
                  className={cn(
                    "w-full transition-shadow",
                    canAfford &&
                      "hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)]"
                  )}
                  disabled={!canAfford || isPending}
                  variant={canAfford ? "default" : "outline"}
                >
                  {!canAfford
                    ? `Need ${reward.pointsRequired - currentXP} more XP`
                    : "Redeem Reward"}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Redeem {reward.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deduct{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {reward.pointsRequired} XP
                  </span>{" "}
                  from your balance. You currently have{" "}
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    {currentXP} XP
                  </span>
                  .
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRedeem} disabled={isPending}>
                  {isPending ? "Redeeming…" : "Confirm Redemption"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
