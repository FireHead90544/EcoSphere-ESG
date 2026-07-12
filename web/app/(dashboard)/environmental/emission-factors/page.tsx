// Emission Factors Page — /environmental/emission-factors
// Server Component: fetches data, checks role, passes to client table.

import { getEmissionFactors } from "@/lib/actions/environmental/emission-factors";
import { requireAuth } from "@/lib/auth-utils";
import { EmissionFactorsTable } from "@/components/environmental/EmissionFactorsTable";
import { Zap, Leaf } from "lucide-react";

export const metadata = {
  title: "Emission Factors — EcoSphere",
  description:
    "Configure carbon emission factors used to calculate CO₂ from operational data.",
};

export default async function EmissionFactorsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const factors = await getEmissionFactors();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
            <Zap className="size-5 text-[--esg-env]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Emission Factors
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Carbon coefficients used to calculate CO₂ from operational activities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Leaf className="size-3.5 text-[--esg-env]" />
          <span>Environmental</span>
        </div>
      </div>

      {/* Info banner for non-admins */}
      {!isAdmin && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Emission factors are managed by administrators. Contact your admin to add or update factors.
        </div>
      )}

      {/* Table */}
      <EmissionFactorsTable factors={factors} isAdmin={isAdmin} />
    </div>
  );
}
