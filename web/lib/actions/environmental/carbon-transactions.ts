"use server";

// Environmental Module — Carbon Transactions Server Actions
// Owner: Team A (Environmental)
//
// Key rules:
//  - co2Kg is NEVER accepted from the client — always computed server-side
//  - Employees can only log for their own department (enforced via session)
//  - After every write: syncGoalProgress() + recomputeEnvironmentalScore()

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  requireAuth,
  requireAdmin,
  getCurrentEmployeeId,
} from "@/lib/auth-utils";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import {
  CarbonTransactionSchema,
  type CarbonTransactionFilter,
} from "@/lib/schemas/environmental";
import type {
  CarbonTransaction,
  CarbonSource,
  ESGConfig,
} from "@/lib/generated/prisma/client";
import { syncGoalProgress } from "@/lib/actions/environmental/goals";
import { recomputeEnvironmentalScore } from "@/lib/actions/environmental/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CarbonTransactionWithRefs extends CarbonTransaction {
  department: { name: string };
  emissionFactor: { activity: string; unit: string; factorKgCO2: number };
}

export interface CarbonSummaryByDept {
  departmentId: string;
  departmentName: string;
  totalCO2Kg: number;
}

export interface CarbonTrendPoint {
  month: string;   // "2026-01", "2026-02", ...
  co2Kg: number;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getCarbonTransactions(
  filters?: CarbonTransactionFilter
): Promise<CarbonTransactionWithRefs[]> {
  await requireAuth();
  return prisma.carbonTransaction.findMany({
    where: {
      ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters?.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            date: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    },
    include: {
      department: { select: { name: true } },
      emissionFactor: { select: { activity: true, unit: true, factorKgCO2: true } },
    },
    orderBy: { date: "desc" },
    take: 500,
  });
}

/**
 * Aggregated CO₂ by department for a date range — used by the bar chart.
 */
export async function getCarbonSummaryByDepartment(
  dateFrom: Date,
  dateTo: Date
): Promise<CarbonSummaryByDept[]> {
  await requireAuth();

  const depts = await prisma.department.findMany({
    where: { status: "ACTIVE" },
    include: {
      carbonTransactions: {
        where: { date: { gte: dateFrom, lte: dateTo } },
        select: { co2Kg: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return depts
    .map((d) => ({
      departmentId: d.id,
      departmentName: d.name,
      totalCO2Kg: d.carbonTransactions.reduce((acc, t) => acc + t.co2Kg, 0),
    }))
    .filter((d) => d.totalCO2Kg > 0);
}

/**
 * Monthly CO₂ totals for trend chart — last N months (default 12).
 */
export async function getCarbonTrendByMonth(
  departmentId?: string,
  months = 12
): Promise<CarbonTrendPoint[]> {
  await requireAuth();

  const now = new Date();
  const result: CarbonTrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const agg = await prisma.carbonTransaction.aggregate({
      where: {
        date: { gte: start, lte: end },
        ...(departmentId ? { departmentId } : {}),
      },
      _sum: { co2Kg: true },
    });

    result.push({
      month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      co2Kg: Math.round((agg._sum.co2Kg ?? 0) * 100) / 100,
    });
  }

  return result;
}

// ─── ESG Config helper ────────────────────────────────────────────────────────

export async function getESGConfig(): Promise<ESGConfig | null> {
  await requireAuth();
  return prisma.eSGConfig.findFirst();
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Log a carbon transaction manually.
 *
 * Security:
 *  - Admins can log for any department
 *  - Employees can only log for their own department
 *
 * Computes co2Kg server-side; never trusts the client value.
 * After write: syncs goal progress + triggers score recompute.
 */
export async function logCarbonTransaction(
  data: unknown
): Promise<ActionResult<CarbonTransaction>> {
  const session = await requireAuth();

  const parsed = CarbonTransactionSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { departmentId, sourceType, quantity, emissionFactorId, date, notes } =
    parsed.data;

  // Role-based department check
  if (session.user.role !== "ADMIN") {
    const employeeId = session.user.employeeId;
    if (!employeeId) return fail("No employee record found for this account.");

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { departmentId: true },
    });
    if (!employee || employee.departmentId !== departmentId) {
      return fail("You can only log carbon data for your own department.");
    }
  }

  // Verify emission factor exists and get factor value
  const factor = await prisma.emissionFactor.findUnique({
    where: { id: emissionFactorId },
  });
  if (!factor) return fail("Emission factor not found.");

  const co2Kg = Math.round(quantity * factor.factorKgCO2 * 1000) / 1000;

  const tx = await prisma.carbonTransaction.create({
    data: {
      departmentId,
      sourceType,
      quantity,
      emissionFactorId,
      co2Kg,
      autoGenerated: false,
      notes: notes ?? null,
      date,
    },
  });

  // Side effects — async but awaited so data is consistent before page refresh
  await syncGoalProgress(departmentId);
  await recomputeEnvironmentalScore(departmentId);

  revalidatePath("/environmental/carbon");
  return ok(tx);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCarbonTransaction(
  id: string
): Promise<ActionResult<void>> {
  await requireAdmin();

  const tx = await prisma.carbonTransaction.findUnique({
    where: { id },
    select: { departmentId: true },
  });
  if (!tx) return fail("Transaction not found.");

  await prisma.carbonTransaction.delete({ where: { id } });

  // Re-sync after deletion so goal progress and score reflect the removal
  await syncGoalProgress(tx.departmentId);
  await recomputeEnvironmentalScore(tx.departmentId);

  revalidatePath("/environmental/carbon");
  return ok(undefined);
}

// ─── Auto-emission Simulation (ERP stub) ──────────────────────────────────────

/**
 * Simulate ERP auto-generation of carbon transactions for a department.
 * Requires: ESGConfig.autoEmission = true AND admin role.
 *
 * Generates a realistic batch: 2 transactions per source type, using emission
 * factors already seeded in the DB. Marks autoGenerated=true.
 */
export async function simulateAutoEmission(
  departmentId: string
): Promise<ActionResult<{ count: number }>> {
  await requireAdmin();

  const config = await prisma.eSGConfig.findFirst();
  if (!config?.autoEmission) {
    return fail(
      "Auto emission calculation is disabled. Enable it in Settings → ESG Configuration."
    );
  }

  const factors = await prisma.emissionFactor.findMany({ take: 10 });
  if (factors.length === 0) {
    return fail(
      "No emission factors configured. Add emission factors first before simulating."
    );
  }

  const sourceTypes: CarbonSource[] = [
    "PURCHASE",
    "MANUFACTURING",
    "EXPENSE",
    "FLEET",
  ];

  const today = new Date();
  const transactions = [];

  for (const sourceType of sourceTypes) {
    // 2 transactions per source type with varied quantities
    for (let i = 0; i < 2; i++) {
      const factor = factors[Math.floor(Math.random() * factors.length)];
      const quantity = Math.round((50 + Math.random() * 200) * 10) / 10;
      const co2Kg = Math.round(quantity * factor.factorKgCO2 * 1000) / 1000;
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      transactions.push({
        departmentId,
        sourceType,
        quantity,
        emissionFactorId: factor.id,
        co2Kg,
        autoGenerated: true,
        date,
        notes: `Auto-generated from simulated ${sourceType.toLowerCase()} records`,
      });
    }
  }

  await prisma.carbonTransaction.createMany({ data: transactions });

  await syncGoalProgress(departmentId);
  await recomputeEnvironmentalScore(departmentId);

  revalidatePath("/environmental/carbon");
  revalidatePath("/environmental");
  return ok({ count: transactions.length });
}
