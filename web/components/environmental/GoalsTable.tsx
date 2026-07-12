"use client";

// Goals Table — with inline progress bars, status badges, admin edit/delete

import { useState, useTransition } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Target } from "lucide-react";
import { GoalProgressBar } from "@/components/environmental/GoalProgressBar";
import { NewGoalDialog } from "@/components/environmental/NewGoalDialog";
import { deleteGoal, type GoalWithDept } from "@/lib/actions/environmental/goals";
import type { Department } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  ON_TRACK: { label: "On Track", className: "bg-[--esg-env]/15 text-[--esg-env] border-[--esg-env]/25" },
  AT_RISK:  { label: "At Risk",  className: "bg-[--chart-4]/15 text-[--chart-4] border-[--chart-4]/25" },
  COMPLETED: { label: "Completed", className: "bg-primary/15 text-primary border-primary/25" },
  ACTIVE:   { label: "Active",   className: "bg-muted text-muted-foreground border-border" },
} as const;

function daysUntil(date: Date): string {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Overdue";
  if (diff === 1) return "1 day left";
  if (diff < 30) return `${diff} days left`;
  const months = Math.floor(diff / 30);
  return `${months} month${months > 1 ? "s" : ""} left`;
}

interface Props {
  goals: GoalWithDept[];
  departments: Pick<Department, "id" | "name">[];
  isAdmin: boolean;
}

export function GoalsTable({ goals, departments, isAdmin }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<GoalWithDept | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (goal: GoalWithDept) => {
    setEditGoal(goal);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditGoal(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this environmental goal?")) return;
    startTransition(async () => { await deleteGoal(id); });
  };

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 gap-3 text-center">
        <Target className="size-12 text-muted-foreground/40" />
        <div>
          <p className="font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            No sustainability goals set
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Create goals to track progress toward your emission reduction targets.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleNew} className="mt-2">Create first goal</Button>
        )}
        <NewGoalDialog open={dialogOpen} onOpenChange={setDialogOpen} departments={departments} editGoal={editGoal} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} ·{" "}
            {goals.filter((g) => g.status === "ON_TRACK").length} on track ·{" "}
            {goals.filter((g) => g.status === "AT_RISK").length} at risk
          </p>
          <Button size="sm" onClick={handleNew}>+ New goal</Button>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Goal</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Department</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground min-w-[200px]">Progress</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal, idx) => {
              const statusCfg = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ACTIVE;
              return (
                <TableRow
                  key={goal.id}
                  className={cn("hover:bg-accent/50 transition-colors", idx % 2 === 1 && "bg-muted/20")}
                >
                  <TableCell className="font-medium max-w-[200px]">
                    <p className="truncate text-sm">{goal.name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {goal.department.name}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <GoalProgressBar
                      currentCO2={goal.currentCO2Kg}
                      targetCO2={goal.targetCO2Kg}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-mono">
                        {new Date(goal.deadline).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{daysUntil(goal.deadline)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusCfg.className)}>
                      {statusCfg.label}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(goal)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(goal.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <NewGoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        departments={departments}
        editGoal={editGoal}
      />
    </div>
  );
}
