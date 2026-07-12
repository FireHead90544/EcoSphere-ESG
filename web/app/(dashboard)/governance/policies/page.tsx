import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getPolicies } from "@/lib/actions/governance";
import { FileCheck, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Policies — Governance | EcoSphere" };

export default async function PoliciesPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const policies = await getPolicies();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            ESG Policies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {policies.length} policy{policies.length !== 1 ? "ies" : ""} — manage compliance documentation
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/governance/policies/new"
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all"
          >
            <Plus className="size-4" />
            New Policy
          </Link>
        )}
      </div>

      {/* Table */}
      {policies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16">
          <FileCheck className="size-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No policies yet.</p>
          {isAdmin && (
            <Link href="/governance/policies/new" className="text-sm text-primary hover:underline">
              Create your first policy →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acknowledged</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {policies.map((policy) => {
                const ackPct = policy.totalEmployees > 0
                  ? Math.round((policy.acknowledgedCount / policy.totalEmployees) * 100)
                  : 100;
                return (
                  <tr key={policy.id} className="bg-card hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-xs">{policy.title}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium bg-[--esg-gov]/10 text-[--esg-gov]">
                        v{policy.version}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(policy.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted/40">
                          <div
                            className={cn("h-full rounded-full", ackPct >= 80 ? "bg-[--esg-env]" : ackPct >= 50 ? "bg-[--esg-gov]" : "bg-destructive")}
                            style={{ width: `${ackPct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {policy.acknowledgedCount}/{policy.totalEmployees}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/governance/policies/${policy.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-[--esg-gov] hover:bg-[--esg-gov]/10 transition-colors"
                      >
                        View <ChevronRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
