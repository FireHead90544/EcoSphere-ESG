import Link from "next/link";
import { requireAuth } from "@/lib/auth-utils";
import { getAudits } from "@/lib/actions/governance";
import { Scale, Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Audits — Governance | EcoSphere" };

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-400",
  UNDER_REVIEW: "bg-[--esg-gov]/10 text-[--esg-gov]",
  COMPLETED: "bg-[--esg-env]/10 text-[--esg-env]",
};
const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled",
  UNDER_REVIEW: "Under Review",
  COMPLETED: "Completed",
};

export default async function AuditsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const audits = await getAudits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Audits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {audits.length} audit record{audits.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/governance/audits/new"
            className="flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all"
          >
            <Plus className="size-4" />
            New Audit
          </Link>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16">
          <Scale className="size-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No audits scheduled yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Auditor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audits.map((audit) => (
                <tr key={audit.id} className="bg-card hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/governance/audits/${audit.id}`}
                      className="font-medium text-foreground hover:text-[--esg-gov] transition-colors line-clamp-1"
                    >
                      {audit.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">{audit.department.name}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{audit.auditorName}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {new Date(audit.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", STATUS_STYLE[audit.status])}>
                      {STATUS_LABEL[audit.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/governance/audits/${audit.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[--esg-gov] transition-colors">
                      {audit._count.complianceIssues} <ChevronRight className="size-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
