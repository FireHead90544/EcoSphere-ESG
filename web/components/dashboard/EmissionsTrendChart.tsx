"use client";

import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCO2 } from "@/lib/gamification-utils";

interface MonthlyPoint {
  month: string;
  [key: string]: number | string;
}

interface EmissionsTrendChartProps {
  data: MonthlyPoint[];
  departments: string[];
}

const DEPT_COLORS: Record<string, string> = {
  Manufacturing: "var(--chart-1)",
  Logistics: "var(--chart-2)",
  Corporate: "var(--chart-3)",
  "R&D": "var(--chart-5)",
};

function getColor(dept: string, idx: number) {
  return (
    DEPT_COLORS[dept] ??
    `var(--chart-${((idx % 5) + 1)})`
  );
}

function EmissionsChart({ data, departments }: EmissionsTrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div>
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Emissions Trend (12 months)
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">CO₂ by department</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            {departments.map((dept, i) => (
              <linearGradient
                key={dept}
                id={`grad-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={getColor(dept, i)} stopOpacity={0.18} />
                <stop offset="95%" stopColor={getColor(dept, i)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="oklch(1 0 0 / 8%)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => formatCO2(v).split(" ")[0]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 8px 24px oklch(0 0 0 / 30%)",
            }}
            formatter={(value: any, name: any) => [formatCO2(value), name]}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-sans)" }}
          />
          {departments.map((dept, i) => (
            <Area
              key={dept}
              type="monotone"
              dataKey={dept}
              stroke={getColor(dept, i)}
              strokeWidth={2}
              fill={`url(#grad-${i})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={800}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// SSR-safe export
export const EmissionsTrendChart = dynamic(
  () => Promise.resolve(EmissionsChart),
  { ssr: false }
);
