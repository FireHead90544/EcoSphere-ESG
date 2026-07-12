"use client";

import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
} from "recharts";

interface RadarPoint {
  dept: string;
  Environmental: number;
  Social: number;
  Governance: number;
}

// Recharts RadarChart requires data as subjects (dimensions) not series (depts)
// Transform: dept rows → dimension rows with dept values
function transformForRadar(data: RadarPoint[]) {
  return [
    { subject: "Environmental", ...Object.fromEntries(data.map((d) => [d.dept, d.Environmental])) },
    { subject: "Social", ...Object.fromEntries(data.map((d) => [d.dept, d.Social])) },
    { subject: "Governance", ...Object.fromEntries(data.map((d) => [d.dept, d.Governance])) },
  ];
}

const DEPT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function SummaryCharts({ radarData }: { radarData: RadarPoint[] }) {
  const chartData = transformForRadar(radarData);
  const depts = radarData.map((d) => d.dept);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          ESG Pillar Radar — All Departments
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Environmental, Social, Governance scores per department</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke="oklch(1 0 0 / 12%)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
          />
          {depts.map((dept, i) => (
            <Radar
              key={dept}
              name={dept}
              dataKey={dept}
              stroke={DEPT_COLORS[i % DEPT_COLORS.length]}
              fill={DEPT_COLORS[i % DEPT_COLORS.length]}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
            }}
          />
          <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export const EsgSummaryCharts = dynamic(
  () => Promise.resolve(SummaryCharts),
  { ssr: false }
);
