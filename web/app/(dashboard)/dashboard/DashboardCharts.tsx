"use client";

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  carbonTrend: { month: string; co2Kg: number }[];
  deptRankings: { name: string; overall: number; environmental: number; social: number; governance: number }[];
}

const CHART_STYLE = {
  tooltip: {
    contentStyle: {
      backgroundColor: "oklch(0.19 0.01 240)",
      border: "1px solid oklch(0.28 0.01 240)",
      borderRadius: "8px",
      fontSize: "12px",
      color: "oklch(0.85 0.01 240)",
    },
    itemStyle: { color: "oklch(0.85 0.01 240)" },
  },
};

export function DashboardCharts({ carbonTrend, deptRankings }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Emissions trend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">Emissions Trend</h2>
        <p className="text-xs text-muted-foreground mb-4">CO₂ equivalent (kg) — last 12 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={carbonTrend} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 240)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_STYLE.tooltip} formatter={(v) => [`${Number(v).toFixed(1)} kg`, "CO₂"]} />

            <Line
              type="monotone"
              dataKey="co2Kg"
              stroke="oklch(0.72 0.19 162)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.72 0.19 162)", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department ranking */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-1">Department ESG Ranking</h2>
        <p className="text-xs text-muted-foreground mb-4">Overall ESG score by department</p>
        {deptRankings.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            No scoring data yet. Run score computation after seeding.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptRankings} margin={{ top: 5, right: 10, bottom: 0, left: -10 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.01 240)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_STYLE.tooltip} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey="environmental" fill="oklch(0.72 0.19 162)" name="Env" radius={[3, 3, 0, 0]} />
              <Bar dataKey="social" fill="oklch(0.72 0.18 200)" name="Social" radius={[3, 3, 0, 0]} />
              <Bar dataKey="governance" fill="oklch(0.72 0.15 85)" name="Gov" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
