"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  code: string;
}

interface ReportFiltersProps {
  departments: Department[];
  showModule?: boolean;
  className?: string;
}

const MODULES = [
  { value: "environmental", label: "Environmental" },
  { value: "social", label: "Social" },
  { value: "governance", label: "Governance" },
  { value: "gamification", label: "Gamification" },
] as const;

export function ReportFilters({
  departments,
  showModule,
  className,
}: ReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dept, setDept] = useState(params.get("dept") ?? "");
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [module, setModule] = useState(params.get("module") ?? "");

  function applyFilters() {
    startTransition(() => {
      const search = new URLSearchParams();
      if (dept) search.set("dept", dept);
      if (from) search.set("from", from);
      if (to) search.set("to", to);
      if (module) search.set("module", module);
      router.push(`${pathname}?${search.toString()}`);
    });
  }

  function resetFilters() {
    setDept("");
    setFrom("");
    setTo("");
    setModule("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const isDirty = !!(dept || from || to || module);

  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      {/* Department */}
      <div className="space-y-1 min-w-[160px]">
        <label className="text-xs text-muted-foreground font-medium">Department</label>
        <Select value={dept || "all"} onValueChange={(v: string | null) => setDept(!v || v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date range */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/80"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground font-medium">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/80"
        />
      </div>

      {/* Module (custom builder only) */}
      {showModule && (
        <div className="space-y-1 min-w-[160px]">
          <label className="text-xs text-muted-foreground font-medium">Module</label>
          <Select value={module || "all"} onValueChange={(v: string | null) => setModule(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {MODULES.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 ml-auto">
        {isDirty && (
          <Button
            size="sm"
            variant="ghost"
            onClick={resetFilters}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        )}
        <Button
          size="sm"
          onClick={applyFilters}
          disabled={isPending}
          className="h-8 gap-1.5 text-xs"
        >
          <Filter className="size-3" />
          {isPending ? "Applying…" : "Apply Filters"}
        </Button>
      </div>
    </div>
  );
}
