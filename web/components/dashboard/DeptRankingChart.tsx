"use client";

import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface DeptScore {
  name: string;
  code: string;
  total: number;
  environmental: number;
  social: number;
  governance: number;
}

interface DeptRankingChartProps {
  departments: DeptScore[];
}

// Colors for top-ranked departments
const RANK_COLORS = [
  "var(--chart-1)", // 1st - emerald
  "var(--chart-2)", // 2nd - teal
  "var(--chart-3)", // 3rd - amber
  "var(--chart-5)", // 4th - violet
  "var(--muted-foreground)", // rest
];

function DeptChart({ departments }: DeptRankingChartProps) {
  const sorted = [...departments].sort((a, b) => b.total - a.total);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div>
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Department ESG Ranking
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Total ESG score by department</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="oklch(1 0 0 / 8%)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="code"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
            width={36}
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
            formatter={(value: any, _: any, entry: any) => {
              const d = entry.payload;
              return [
                <div key="body" className="space-y-0.5 text-xs">
                  <div>Total: <strong>{value.toFixed(1)}</strong></div>
                  <div>Env: {d.environmental.toFixed(1)} · Social: {d.social.toFixed(1)} · Gov: {d.governance.toFixed(1)}</div>
                </div>,
                d.name,
              ];
            }}
            cursor={{ fill: "oklch(1 0 0 / 4%)" }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} animationDuration={800}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)]}
                opacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const DeptRankingChart = dynamic(
  () => Promise.resolve(DeptChart),
  { ssr: false }
);
