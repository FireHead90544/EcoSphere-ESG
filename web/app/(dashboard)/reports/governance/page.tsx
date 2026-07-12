import { requireAuth } from "@/lib/auth-utils";
import { getGovernanceReportData } from "@/lib/actions/reports";
import { GovernanceCharts } from "@/app/(dashboard)/reports/governance/GovernanceCharts";
import { Download, FileText } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Governance Report — EcoSphere" };

export default async function GovernanceReportPage() {
  await requireAuth();
  const data = await getGovernanceReportData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Governance Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive overview of policies, audits, and compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/reports/governance/csv"
            download="governance_report.csv"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Download className="size-4 text-muted-foreground" /> Export CSV
          </a>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-50 cursor-not-allowed">
            <FileText className="size-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Row (Audit Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Scheduled Audits</p>
          <p className="text-3xl font-bold font-mono mt-1 text-foreground">{data.auditSummary.scheduled}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Under Review</p>
          <p className="text-3xl font-bold font-mono mt-1 text-[--esg-gov]">{data.auditSummary.underReview}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Completed Audits</p>
          <p className="text-3xl font-bold font-mono mt-1 text-[--esg-env]">{data.auditSummary.completed}</p>
        </div>
      </div>

      {/* Charts Row */}
      <GovernanceCharts issues={data.issuesBySeverity} govScores={data.govScores} />

      {/* Policy Compliance Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/40 p-4">
          <h2 className="text-sm font-semibold text-foreground">Policy Acknowledgement by Department</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Ack Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.complianceByDept.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No data available.</td></tr>
              )}
              {data.complianceByDept.map((row) => (
                <tr key={row.department} className="hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{row.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${row.ackRate === 100 ? "bg-[--esg-env]" : row.ackRate >= 75 ? "bg-[--esg-gov]" : "bg-destructive"}`}
                          style={{ width: `${row.ackRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{row.ackRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.ackRate === 100 ? "bg-[--esg-env]/10 text-[--esg-env]" : row.ackRate >= 75 ? "bg-[--esg-gov]/10 text-[--esg-gov]" : "bg-destructive/10 text-destructive"}`}>
                      {row.ackRate === 100 ? "Compliant" : row.ackRate >= 75 ? "Action Needed" : "At Risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
