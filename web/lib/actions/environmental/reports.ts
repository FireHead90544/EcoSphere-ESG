"use server";

// Environmental Module — Report Data + Export Actions
// Owner: Team A (Environmental)

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { fromZodError, ok, type ActionResult } from "@/lib/schemas/shared";
import { EnvironmentalReportFilterSchema } from "@/lib/schemas/environmental";

// ─── Report Data ──────────────────────────────────────────────────────────────

export interface EnvironmentalReportData {
  period: { from: Date; to: Date };
  totalCO2Kg: number;
  byDepartment: { name: string; co2Kg: number; txCount: number }[];
  bySourceType: { sourceType: string; co2Kg: number }[];
  monthlyTrend: { month: string; co2Kg: number }[];
  goalsCompleted: number;
  goalsOnTrack: number;
  goalsAtRisk: number;
  topEmissionFactors: { activity: string; unit: string; totalCO2Kg: number }[];
  productProfiles: {
    productName: string;
    co2PerUnit: number;
    recyclable: boolean;
  }[];
}

/**
 * Gather all data needed for the Environmental Report.
 * Called by both the standalone /reports/environmental page and the
 * Custom Report Builder (Team D).
 */
export async function getEnvironmentalReportData(
  filters: unknown
): Promise<ActionResult<EnvironmentalReportData>> {
  await requireAuth();

  const parsed = EnvironmentalReportFilterSchema.safeParse(filters);
  if (!parsed.success) return fromZodError(parsed.error);

  const { departmentId, dateFrom, dateTo } = parsed.data;

  const txWhere = {
    date: { gte: dateFrom, lte: dateTo },
    ...(departmentId ? { departmentId } : {}),
  };

  const [transactions, goals, products, departments] = await Promise.all([
    prisma.carbonTransaction.findMany({
      where: txWhere,
      include: {
        department: { select: { name: true } },
        emissionFactor: { select: { activity: true, unit: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.environmentalGoal.findMany({
      where: departmentId ? { departmentId } : {},
      select: { status: true },
    }),
    prisma.productESGProfile.findMany({
      orderBy: { productName: "asc" },
    }),
    prisma.department.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
    }),
  ]);

  // Aggregation: total
  const totalCO2Kg =
    Math.round(transactions.reduce((s, t) => s + t.co2Kg, 0) * 10) / 10;

  // By department
  const deptMap = new Map<string, { name: string; co2Kg: number; txCount: number }>();
  for (const tx of transactions) {
    const key = tx.departmentId;
    const existing = deptMap.get(key) ?? { name: tx.department.name, co2Kg: 0, txCount: 0 };
    deptMap.set(key, {
      name: existing.name,
      co2Kg: Math.round((existing.co2Kg + tx.co2Kg) * 10) / 10,
      txCount: existing.txCount + 1,
    });
  }
  const byDepartment = Array.from(deptMap.values()).sort((a, b) => b.co2Kg - a.co2Kg);

  // By source type
  const sourceMap = new Map<string, number>();
  for (const tx of transactions) {
    sourceMap.set(tx.sourceType, (sourceMap.get(tx.sourceType) ?? 0) + tx.co2Kg);
  }
  const bySourceType = Array.from(sourceMap.entries())
    .map(([sourceType, co2Kg]) => ({ sourceType, co2Kg: Math.round(co2Kg * 10) / 10 }))
    .sort((a, b) => b.co2Kg - a.co2Kg);

  // Monthly trend within the date range
  const monthSet = new Map<string, number>();
  for (const tx of transactions) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    monthSet.set(key, (monthSet.get(key) ?? 0) + tx.co2Kg);
  }
  const monthlyTrend = Array.from(monthSet.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, co2Kg]) => ({ month, co2Kg: Math.round(co2Kg * 10) / 10 }));

  // Goals breakdown
  const goalsCompleted = goals.filter((g) => g.status === "COMPLETED").length;
  const goalsOnTrack = goals.filter((g) => g.status === "ON_TRACK").length;
  const goalsAtRisk = goals.filter((g) => g.status === "AT_RISK").length;

  // Top emission factors by CO₂ contribution
  const factorMap = new Map<string, { activity: string; unit: string; totalCO2Kg: number }>();
  for (const tx of transactions) {
    const key = tx.emissionFactorId;
    const existing = factorMap.get(key) ?? {
      activity: tx.emissionFactor.activity,
      unit: tx.emissionFactor.unit,
      totalCO2Kg: 0,
    };
    factorMap.set(key, {
      ...existing,
      totalCO2Kg: Math.round((existing.totalCO2Kg + tx.co2Kg) * 10) / 10,
    });
  }
  const topEmissionFactors = Array.from(factorMap.values())
    .sort((a, b) => b.totalCO2Kg - a.totalCO2Kg)
    .slice(0, 10);

  return ok({
    period: { from: dateFrom, to: dateTo },
    totalCO2Kg,
    byDepartment,
    bySourceType,
    monthlyTrend,
    goalsCompleted,
    goalsOnTrack,
    goalsAtRisk,
    topEmissionFactors,
    productProfiles: products.map((p) => ({
      productName: p.productName,
      co2PerUnit: p.co2PerUnit,
      recyclable: p.recyclable,
    })),
  });
}
