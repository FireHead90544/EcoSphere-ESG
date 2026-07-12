import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getPolicies, getMyPendingPolicies, sendAcknowledgementReminders } from "@/lib/actions/governance";
import { RemindersButton } from "@/app/(dashboard)/governance/acknowledgements/RemindersButton";
import { Check, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Acknowledgements — Governance | EcoSphere" };

export default async function AcknowledgementsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const policies = await getPolicies();

  if (!isAdmin) {
    // Employee view — their pending policies
    const pending = await getMyPendingPolicies();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            My Acknowledgements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Policies requiring your attention.
          </p>
        </div>
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-[--esg-env]/30 bg-[--esg-env]/5 py-16">
            <Check className="size-12 text-[--esg-env]" />
            <p className="text-sm font-medium text-[--esg-env]">All policies acknowledged!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((policy) => (
              <Link
                key={policy.id}
                href={`/governance/policies/${policy.id}`}
                className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors group"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15 shrink-0">
                  <Clock className="size-4.5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{policy.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    v{policy.version} · {new Date(policy.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-amber-400 group-hover:underline">
                  Read & Acknowledge →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin view — all policies with ack progress + reminder buttons
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Policy Acknowledgements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor acknowledgement rates across all employees.
        </p>
      </div>

      <div className="space-y-3">
        {policies.map((policy) => {
          const ackPct = policy.totalEmployees > 0
            ? Math.round((policy.acknowledgedCount / policy.totalEmployees) * 100)
            : 100;
          const pending = policy.totalEmployees - policy.acknowledgedCount;
          return (
            <div
              key={policy.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/governance/policies/${policy.id}`}
                    className="text-sm font-medium text-foreground hover:text-[--esg-gov] transition-colors"
                  >
                    {policy.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    v{policy.version} · {policy.acknowledgedCount}/{policy.totalEmployees} employees acknowledged
                  </p>
                </div>
                {pending > 0 && (
                  <RemindersButton policyId={policy.id} pending={pending} />
                )}
                {pending === 0 && (
                  <span className="shrink-0 flex items-center gap-1 text-xs text-[--esg-env] font-medium">
                    <Check className="size-3.5" /> Complete
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-muted/40">
                  <div
                    className={cn("h-full rounded-full transition-all", ackPct >= 80 ? "bg-[--esg-env]" : ackPct >= 50 ? "bg-[--esg-gov]" : "bg-destructive")}
                    style={{ width: `${ackPct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-right">{ackPct}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
