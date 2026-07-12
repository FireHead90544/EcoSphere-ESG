// Environmental Goals Page — /environmental/goals
import { requireAuth } from "@/lib/auth-utils";
import { getEnvironmentalGoals } from "@/lib/actions/environmental/goals";
import { GoalsTable } from "@/components/environmental/GoalsTable";
import { prisma } from "@/lib/prisma";
import { Target } from "lucide-react";

export const metadata = {
  title: "Environmental Goals — EcoSphere",
  description: "Track sustainability targets and CO₂ reduction goals per department.",
};

export default async function GoalsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const [goals, departments] = await Promise.all([
    getEnvironmentalGoals(),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/25">
          <Target className="size-5 text-[--esg-env]" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Environmental Goals
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            CO₂ reduction targets with real-time progress tracking.
          </p>
        </div>
      </div>

      <GoalsTable goals={goals} departments={departments} isAdmin={isAdmin} />
    </div>
  );
}
