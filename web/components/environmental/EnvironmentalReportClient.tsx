"use client";

// Environmental Report Client — interactive filter controls + export buttons
// Used by the report page which handles initial data loading server-side.

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Target, Leaf, FileBarChart } from "lucide-react";
import { getEnvironmentalReportData } from "@/lib/actions/environmental/reports";
import type { EnvironmentalReportData } from "@/lib/actions/environmental/reports";
import { cn } from "@/lib/utils";

interface Props {
  initialData: EnvironmentalReportData | null;
}

export function EnvironmentalReportClient({ initialData }: Props) {
  const [data, setData] = useState<EnvironmentalReportData | null>(initialData);
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(async () => {
      const result = await getEnvironmentalReportData({
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
      });
      if (result.success) setData(result.data);
    });
  };

  const exportCSV = () => {
    if (!data) return;
    const header = "Department,CO₂ (kg),Transactions\n";
    const rows = data.byDepartment.map(
      (d) => `"${d.name}",${d.co2Kg},${d.txCount}`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `environmental-report-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rep-from">From</Label>
              <Input
                id="rep-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-36"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-to">To</Label>
              <Input
                id="rep-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-36"
              />
            </div>
            <Button onClick={refresh} disabled={isPending} variant="outline">
              {isPending ? "Loading…" : "Apply filter"}
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={!data} className="gap-1.5">
                <Download className="size-3.5" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!data ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <FileBarChart className="size-8 mr-3 opacity-40" />
          No data for selected period.
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total CO₂", value: `${data.totalCO2Kg} kg`, icon: <Leaf className="size-4" /> },
              { label: "Goals Completed", value: data.goalsCompleted.toString(), icon: <Target className="size-4" /> },
              { label: "Goals On Track", value: data.goalsOnTrack.toString(), icon: <Target className="size-4" /> },
              { label: "Goals At Risk", value: data.goalsAtRisk.toString(), icon: <Target className="size-4" /> },
            ].map((kpi) => (
              <Card key={kpi.label} className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[--chart-1]/60 to-transparent" />
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <p className="font-mono text-2xl font-bold mt-2 text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CO₂ by Department */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                Emissions by Department
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {data.period.from.toLocaleDateString("en-IN")} — {data.period.to.toLocaleDateString("en-IN")}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Department</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">Transactions</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">CO₂ (kg)</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byDepartment.map((d, idx) => (
                    <TableRow key={d.name} className={cn("hover:bg-accent/50", idx % 2 === 1 && "bg-muted/20")}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{d.txCount}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-[--esg-env] font-medium">{d.co2Kg.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {data.totalCO2Kg > 0
                          ? `${Math.round((d.co2Kg / data.totalCO2Kg) * 100)}%`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top emission factors */}
          {data.topEmissionFactors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  Top Emission Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.topEmissionFactors.slice(0, 5).map((f) => (
                    <div key={f.activity} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{f.activity}</span>
                      <span className="font-mono text-[--esg-env] font-medium shrink-0">
                        {f.totalCO2Kg.toFixed(2)} kg CO₂
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
