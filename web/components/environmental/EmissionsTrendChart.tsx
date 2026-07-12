"use client";

// Emissions Trend Chart — 12-month area chart with gradient fill
// Recharts AreaChart, animationDuration=800, --chart-1 emerald colors

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendPoint } from "@/lib/actions/environmental/dashboard";

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("en", {
    month: "short",
  });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card shadow-lg px-3 py-2 text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-mono font-semibold text-[--esg-env]">
        {payload[0].value.toFixed(2)} kg CO₂
      </p>
    </div>
  );
};

interface Props {
  data: TrendPoint[];
}

export function EmissionsTrendChart({ data }: Props) {
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.co2Kg, 0) / data.length : 0;

  const chartData = data.map((d) => ({
    month: formatMonth(d.month),
    co2Kg: d.co2Kg,
  }));

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--chart-1]/60 to-transparent" />
      <CardHeader className="pb-2">
        <CardTitle
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          12-Month Emissions Trend
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Total CO₂ (kg) per month, all departments
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="envGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: `Avg ${avg.toFixed(0)}kg`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="co2Kg"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#envGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--chart-1)" }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
