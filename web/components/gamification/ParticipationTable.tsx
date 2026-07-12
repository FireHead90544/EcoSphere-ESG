"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { approveChallengeParticipation } from "@/lib/actions/gamification";
import { toast } from "sonner";
import { daysUntil } from "@/lib/gamification-utils";
import { CheckCircle2, XCircle, ExternalLink, Clock } from "lucide-react";
import type { ApprovalStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

const APPROVAL_BADGE: Record<ApprovalStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-chart-3/15 text-chart-3 border-chart-3/25" },
  APPROVED: { label: "Approved", className: "bg-chart-1/15 text-chart-1 border-chart-1/25" },
  REJECTED: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/25" },
};

// ─── Admin row type ───────────────────────────────────────────────────────────

interface AdminRow {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  challengeTitle: string;
  xpAtStake: number;
  proofUrl: string | null;
  evidenceRequired: boolean;
  approval: ApprovalStatus;
  createdAt: Date;
}

// ─── Employee row type ────────────────────────────────────────────────────────

interface EmployeeRow {
  id: string;
  challengeTitle: string;
  categoryName: string;
  xpAtStake: number;
  xpAwarded: number;
  proofUrl: string | null;
  approval: ApprovalStatus;
  progress: number;
  deadline: Date;
  createdAt: Date;
}

// ─── Approve/Reject button cell ───────────────────────────────────────────────

function ApprovalActions({ participationId }: { participationId: string }) {
  const [isPending, startTransition] = useTransition();

  function handle(action: "APPROVE" | "REJECT") {
    startTransition(async () => {
      const result = await approveChallengeParticipation({
        participationId,
        action,
      });
      if (result.success) {
        toast.success(action === "APPROVE" ? "Approved — XP awarded" : "Submission rejected");
      } else {
        toast.error("Action failed", { description: result.error });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle("APPROVE")}
        disabled={isPending}
        className="h-7 gap-1 text-chart-1 hover:text-chart-1 hover:bg-chart-1/10"
      >
        <CheckCircle2 className="size-3.5" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle("REJECT")}
        disabled={isPending}
        className="h-7 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <XCircle className="size-3.5" />
        Reject
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParticipationTable(
  props:
    | { mode: "admin"; rows: AdminRow[] }
    | { mode: "employee"; rows: EmployeeRow[] }
) {
  if (props.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-14 text-center">
        <Clock className="size-10 text-muted-foreground/30 mb-3" />
        <h3
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {props.mode === "admin"
            ? "No pending submissions"
            : "No challenge submissions yet"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {props.mode === "admin"
            ? "All submissions have been reviewed."
            : "Join an active challenge and submit your proof to see it here."}
        </p>
      </div>
    );
  }

  if (props.mode === "admin") {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Employee</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Challenge</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">XP</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Proof</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.rows.map((row, i) => {
              const badge = APPROVAL_BADGE[row.approval];
              return (
                <TableRow
                  key={row.id}
                  className={cn(i % 2 === 0 ? "bg-transparent" : "bg-muted/20", "hover:bg-accent/50")}
                >
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{row.department}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{row.challengeTitle}</TableCell>
                  <TableCell>
                    <span
                      className="text-sm font-medium text-[--score-gold]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      +{row.xpAtStake} XP
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.proofUrl ? (
                      <a
                        href={row.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View proof <ExternalLink className="size-3" />
                      </a>
                    ) : row.evidenceRequired ? (
                      <span className="text-xs text-destructive">Missing</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs border", badge.className)}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.approval === "PENDING" ? (
                      <ApprovalActions participationId={row.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Reviewed</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Employee mode
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Challenge</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Progress</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">XP</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Deadline</TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.rows.map((row, i) => {
            const badge = APPROVAL_BADGE[row.approval];
            const days = daysUntil(row.deadline);
            return (
              <TableRow
                key={row.id}
                className={cn(i % 2 === 0 ? "bg-transparent" : "bg-muted/20", "hover:bg-accent/50")}
              >
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.challengeTitle}</p>
                    <p className="text-xs text-muted-foreground">{row.categoryName}</p>
                  </div>
                </TableCell>
                <TableCell className="w-40">
                  <div className="space-y-1">
                    <Progress value={row.progress} className="h-1.5" />
                    <span
                      className="text-xs text-muted-foreground font-mono"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {row.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-sm font-medium font-mono",
                      row.xpAwarded > 0 ? "text-chart-1" : "text-muted-foreground"
                    )}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {row.xpAwarded > 0 ? `+${row.xpAwarded}` : `${row.xpAtStake}`} XP
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-xs",
                      days < 0 ? "text-destructive" : days <= 3 ? "text-chart-4" : "text-muted-foreground"
                    )}
                  >
                    {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs border", badge.className)}>
                    {badge.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
