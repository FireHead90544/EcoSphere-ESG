// Carbon Transactions Page — /environmental/carbon
// Server Component: fetches data, passes to client table.

import { requireAuth, getCurrentEmployeeId } from "@/lib/auth-utils";
import { getCarbonTransactions, getESGConfig } from "@/lib/actions/environmental/carbon-transactions";
import { getEmissionFactors } from "@/lib/actions/environmental/emission-factors";
import { CarbonTransactionsTable } from "@/components/environmental/CarbonTransactionsTable";
import { prisma } from "@/lib/prisma";
import { Factory } from "lucide-react";

export const metadata = {
  title: "Carbon Transactions — EcoSphere",
  description: "Track and manage carbon emission transactions across departments.",
};

export default async function CarbonPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  // Get employee's dept for non-admin lock
  let lockedDepartmentId: string | undefined;
  if (!isAdmin && session.user.employeeId) {
    const emp = await prisma.employee.findUnique({
      where: { id: session.user.employeeId },
      select: { departmentId: true },
    });
    lockedDepartmentId = emp?.departmentId;
  }

  const [transactions, emissionFactors, departments, config] = await Promise.all([
    getCarbonTransactions(),
    getEmissionFactors(),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getESGConfig(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
          <Factory className="size-5 text-[--esg-env]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Carbon Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Emission events logged from operational activities across all departments.
          </p>
        </div>
      </div>

      <CarbonTransactionsTable
        transactions={transactions}
        departments={departments}
        emissionFactors={emissionFactors}
        isAdmin={isAdmin}
        autoEmissionEnabled={config?.autoEmission ?? false}
        lockedDepartmentId={lockedDepartmentId}
      />
    </div>
  );
}
