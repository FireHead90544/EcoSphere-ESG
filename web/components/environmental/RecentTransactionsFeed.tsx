"use client";

// Recent Transactions Feed — timeline list for the dashboard

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import type { RecentTransaction } from "@/lib/actions/environmental/dashboard";
import { cn } from "@/lib/utils";

const SOURCE_COLORS: Record<string, string> = {
  PURCHASE: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  MANUFACTURING: "bg-chart-5/15 text-chart-5 border-chart-5/25",
  EXPENSE: "bg-chart-3/15 text-chart-3 border-chart-3/25",
  FLEET: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  MANUAL: "bg-muted text-muted-foreground border-border",
};

const SOURCE_LABELS: Record<string, string> = {
  PURCHASE: "Purchase", MANUFACTURING: "Mfg", EXPENSE: "Expense", FLEET: "Fleet", MANUAL: "Manual",
};

interface Props {
  transactions: RecentTransaction[];
}

export function RecentTransactionsFeed({ transactions }: Props) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--chart-1]/60 to-transparent" />
      <CardHeader className="pb-2">
        <CardTitle
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Recent Transactions
        </CardTitle>
        <p className="text-xs text-muted-foreground">Last 10 emission events</p>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Leaf className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((t, idx) => (
              <div
                key={t.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent/40",
                  "animate-in fade-in duration-300"
                )}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Date pill */}
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full min-w-[68px] text-center">
                  {new Date(t.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>

                {/* Dept */}
                <span className="text-xs text-foreground flex-1 min-w-0 truncate">
                  {t.departmentName}
                </span>

                {/* Source */}
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0 shrink-0", SOURCE_COLORS[t.sourceType])}
                >
                  {SOURCE_LABELS[t.sourceType]}
                </Badge>

                {/* CO₂ */}
                <span className="font-mono text-sm font-semibold text-[--esg-env] shrink-0">
                  {t.co2Kg.toFixed(2)} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
