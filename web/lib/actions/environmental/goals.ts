"use server";

// Environmental Module — Environmental Goals Server Actions
// Owner: Team A (Environmental)

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import {
  EnvironmentalGoalSchema,
  EnvironmentalGoalUpdateSchema,
} from "@/lib/schemas/environmental";
import type { EnvironmentalGoal, GoalStatus } from "@/lib/generated/prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute the auto-derived GoalStatus for a goal given current CO₂ and deadline.
 * Rule:
 *   - currentCO2 >= targetCO2         → COMPLETED
 *   - progress > 80% OR deadline < 7d → AT_RISK
 *   - progress ≤ 50% AND deadline > 30d → ON_TRACK
 *   - else                            → ACTIVE
 */
function deriveGoalStatus(
  currentCO2Kg: number,
  targetCO2Kg: number,
  deadline: Date
): GoalStatus {
  const now = new Date();
  const daysLeft = Math.floor(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPct = targetCO2Kg > 0 ? (currentCO2Kg / targetCO2Kg) * 100 : 0;

  if (currentCO2Kg >= targetCO2Kg) return "COMPLETED";
  if (progressPct > 80 || daysLeft < 7) return "AT_RISK";
  if (progressPct <= 50 && daysLeft > 30) return "ON_TRACK";
  return "ACTIVE";
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export interface GoalWithDept extends EnvironmentalGoal {
  department: { name: string };
}

export async function getEnvironmentalGoals(filters?: {
  departmentId?: string;
  status?: GoalStatus;
}): Promise<GoalWithDept[]> {
  await requireAuth();
  return prisma.environmentalGoal.findMany({
    where: {
      ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: { department: { select: { name: true } } },
    orderBy: { deadline: "asc" },
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new environmental goal.
 * Initialises currentCO2Kg from the sum of all existing carbon transactions
 * for that department — so the progress is accurate from day 0.
 */
export async function createGoal(data: unknown): Promise<ActionResult<EnvironmentalGoal>> {
  await requireAdmin();

  const parsed = EnvironmentalGoalSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { name, departmentId, targetCO2Kg, deadline } = parsed.data;

  // Seed current CO₂ from existing transactions
  const agg = await prisma.carbonTransaction.aggregate({
    where: { departmentId },
    _sum: { co2Kg: true },
  });
  const currentCO2Kg = agg._sum.co2Kg ?? 0;

  const status = deriveGoalStatus(currentCO2Kg, targetCO2Kg, deadline);

  const goal = await prisma.environmentalGoal.create({
    data: { name, departmentId, targetCO2Kg, currentCO2Kg, deadline, status },
  });

  revalidatePath("/environmental/goals");
  revalidatePath("/environmental");
  return ok(goal);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateGoal(
  id: string,
  data: unknown
): Promise<ActionResult<EnvironmentalGoal>> {
  await requireAdmin();

  const parsed = EnvironmentalGoalUpdateSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const existing = await prisma.environmentalGoal.findUnique({ where: { id } });
  if (!existing) return fail("Goal not found.");

  const targetCO2Kg = parsed.data.targetCO2Kg ?? existing.targetCO2Kg;
  const deadline = parsed.data.deadline ?? existing.deadline;
  const status = deriveGoalStatus(existing.currentCO2Kg, targetCO2Kg, deadline);

  const goal = await prisma.environmentalGoal.update({
    where: { id },
    data: { ...parsed.data, status },
  });

  revalidatePath("/environmental/goals");
  revalidatePath("/environmental");
  return ok(goal);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteGoal(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.environmentalGoal.delete({ where: { id } });
  revalidatePath("/environmental/goals");
  revalidatePath("/environmental");
  return ok(undefined);
}

// ─── Sync (internal — called by logCarbonTransaction) ─────────────────────────

/**
 * Re-sums all carbon transactions for a department and updates currentCO2Kg +
 * status on every active goal for that department.
 * Called automatically after every Carbon Transaction write — never needs to be
 * triggered manually.
 */
export async function syncGoalProgress(departmentId: string): Promise<void> {
  const agg = await prisma.carbonTransaction.aggregate({
    where: { departmentId },
    _sum: { co2Kg: true },
  });
  const totalCO2 = agg._sum.co2Kg ?? 0;

  const goals = await prisma.environmentalGoal.findMany({
    where: { departmentId, status: { not: "COMPLETED" } },
  });

  for (const goal of goals) {
    const status = deriveGoalStatus(totalCO2, goal.targetCO2Kg, goal.deadline);
    await prisma.environmentalGoal.update({
      where: { id: goal.id },
      data: { currentCO2Kg: totalCO2, status },
    });
  }

  revalidatePath("/environmental/goals");
  revalidatePath("/environmental");
}
