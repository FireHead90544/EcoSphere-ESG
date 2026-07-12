"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Sheet, FileDown } from "lucide-react";

interface ExportButtonsProps {
  reportType: string;
  filters?: Record<string, string | undefined>;
}

function buildExportUrl(
  type: string,
  format: string,
  filters?: Record<string, string | undefined>
): string {
  const params = new URLSearchParams({ format });
  if (filters?.dept) params.set("dept", filters.dept);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.module) params.set("module", filters.module);
  return `/api/reports/${type}/export?${params.toString()}`;
}

export function ExportButtons({ reportType, filters }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-muted-foreground hidden sm:inline">Export:</span>
      {(
        [
          { format: "pdf", icon: FileText, label: "PDF" },
          { format: "xlsx", icon: Sheet, label: "Excel" },
          { format: "csv", icon: FileDown, label: "CSV" },
        ] as const
      ).map(({ format, icon: Icon, label }) => (
        <a
          key={format}
          href={buildExportUrl(reportType, format, filters)}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Icon className="size-3.5" />
            {label}
          </Button>
        </a>
      ))}
    </div>
  );
}
