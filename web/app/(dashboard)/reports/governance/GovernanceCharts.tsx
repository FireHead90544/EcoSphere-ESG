"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface Props {
  issues: { severity: string; count: number; fill: string }[];
  govScores: { department: string; score: number }[];
}

export function GovernanceCharts({ issues, govScores }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Issues by Severity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Compliance Issues by Severity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issues} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(0.28 0.01 240)" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="severity" 
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} 
                axisLine={false} 
                tickLine={false}
                width={70}
              />
              <Tooltip 
                cursor={{ fill: "oklch(0.28 0.01 240 / 0.2)" }}
                contentStyle={{ backgroundColor: "oklch(0.13 0.03 240)", borderColor: "oklch(0.28 0.01 240)", borderRadius: 8, fontSize: 12, color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {issues.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Governance Score by Dept */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Governance Score by Department</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={govScores} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.28 0.01 240)" />
              <XAxis 
                dataKey="department" 
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: "oklch(0.28 0.01 240 / 0.2)" }}
                contentStyle={{ backgroundColor: "oklch(0.13 0.03 240)", borderColor: "oklch(0.28 0.01 240)", borderRadius: 8, fontSize: 12, color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="score" fill="var(--esg-gov)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
