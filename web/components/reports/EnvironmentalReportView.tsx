"use client";

import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatCO2 } from "@/lib/gamification-utils";

interface EnvironmentalReportChartsProps {
  byMonth: { month: string; co2Kg: number }[];
  bySource: { name: string; co2Kg: number }[];
  byDept: { name: string; co2Kg: number; txCount: number }[];
}

const SOURCE_COLORS: Record<string, string> = {
  MANUFACTURING: "var(--chart-1)",
  FLEET: "var(--chart-2)",
  EXPENSE: "var(--chart-3)",
  PURCHASE: "var(--chart-4)",
  MANUAL: "var(--chart-5)",
};

function ChartsImpl({ byMonth, bySource, byDept }: EnvironmentalReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Monthly trend */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Monthly CO₂ Trend
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={byMonth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="oklch(1 0 0 / 8%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => formatCO2(v).split(" ")[0]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 11 }}
              formatter={(v: any) => [formatCO2(v), "CO₂e"]}
            />
            <Area type="monotone" dataKey="co2Kg" stroke="var(--chart-1)" strokeWidth={2} fill="url(#co2Grad)" dot={false} animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* By source (pie) */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          CO₂ by Source Type
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={bySource} dataKey="co2Kg" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} animationDuration={800}>
              {bySource.map((entry, i) => (
                <Cell key={i} fill={SOURCE_COLORS[entry.name] ?? `var(--chart-${(i % 5) + 1})`} opacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 11 }}
              formatter={(v: any, name: any) => [formatCO2(v), name]}
            />
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* By department (bar) */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 lg:col-span-2">
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          CO₂ by Department
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byDept} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="oklch(1 0 0 / 8%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => formatCO2(v).split(" ")[0]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 11 }}
              formatter={(v: any) => [formatCO2(v), "CO₂e"]}
            />
            <Bar dataKey="co2Kg" fill="var(--chart-1)" opacity={0.85} radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const EnvironmentalReportCharts = dynamic(
  () => Promise.resolve(ChartsImpl),
  { ssr: false }
);
