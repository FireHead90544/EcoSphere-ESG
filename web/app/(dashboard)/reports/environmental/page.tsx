// Environmental Report Page — /reports/environmental
// Server Component: renders the printable report view with filter controls and export buttons.

import { requireAuth } from "@/lib/auth-utils";
import { getEnvironmentalReportData } from "@/lib/actions/environmental/reports";
import { EnvironmentalReportClient } from "@/components/environmental/EnvironmentalReportClient";
import { FileBarChart } from "lucide-react";

export const metadata = {
  title: "Environmental Report — EcoSphere",
  description: "Comprehensive environmental report with CO₂ emissions data, goals, and trend analysis.",
};

export default async function EnvironmentalReportPage() {
  await requireAuth();

  // Default: current month
  const now = new Date();
  const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const dateTo = now;

  const result = await getEnvironmentalReportData({ dateFrom, dateTo });
  const data = result.success ? result.data : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
          <FileBarChart className="size-5 text-[--esg-env]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Environmental Report
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            CO₂ emissions summary, goal completion, and trend analysis.
          </p>
        </div>
      </div>

      <EnvironmentalReportClient initialData={data} />
    </div>
  );
}
