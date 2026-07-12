"use server";

// Environmental Module — Emission Factors Server Actions
// Owner: Team A (Environmental)
// All admin mutations use requireAdmin(); reads use requireAuth().

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import { EmissionFactorSchema } from "@/lib/schemas/environmental";
import type { EmissionFactor } from "@/lib/generated/prisma/client";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * List all emission factors, ordered alphabetically by activity name.
 * Available to all authenticated users (employees need to see this in the
 * carbon transaction form).
 */
export async function getEmissionFactors(): Promise<EmissionFactor[]> {
  await requireAuth();
  return prisma.emissionFactor.findMany({
    orderBy: { activity: "asc" },
  });
}

/**
 * Get a single emission factor by ID.
 */
export async function getEmissionFactorById(
  id: string
): Promise<EmissionFactor | null> {
  await requireAuth();
  return prisma.emissionFactor.findUnique({ where: { id } });
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new emission factor. Admin-only.
 * Validates uniqueness of the activity name (case-insensitive).
 */
export async function createEmissionFactor(
  data: unknown
): Promise<ActionResult<EmissionFactor>> {
  await requireAdmin();

  const parsed = EmissionFactorSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { activity, factorKgCO2, unit, source } = parsed.data;

  // Uniqueness check — SQLite: use LIKE for case-insensitive, or just lowercase comparison post-fetch
  const allFactors = await prisma.emissionFactor.findMany({ select: { id: true, activity: true } });
  const existing = allFactors.find(
    (f) => f.activity.toLowerCase() === activity.toLowerCase()
  );
  if (existing) {
    return fail("An emission factor with this activity name already exists.");
  }

  const factor = await prisma.emissionFactor.create({
    data: {
      activity,
      factorKgCO2,
      unit,
      source: source ?? null,
    },
  });

  revalidatePath("/environmental/emission-factors");
  revalidatePath("/environmental/carbon"); // carbon form needs updated factor list
  return ok(factor);
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update an existing emission factor. Admin-only.
 * Checks uniqueness again in case the activity name was changed.
 */
export async function updateEmissionFactor(
  id: string,
  data: unknown
): Promise<ActionResult<EmissionFactor>> {
  await requireAdmin();

  const parsed = EmissionFactorSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { activity, factorKgCO2, unit, source } = parsed.data;

  // Uniqueness check — exclude self
  const allFactors = await prisma.emissionFactor.findMany({ select: { id: true, activity: true } });
  const existing = allFactors.find(
    (f) => f.activity.toLowerCase() === activity.toLowerCase() && f.id !== id
  );
  if (existing) {
    return fail("An emission factor with this activity name already exists.");
  }

  const factor = await prisma.emissionFactor.update({
    where: { id },
    data: {
      activity,
      factorKgCO2,
      unit,
      source: source ?? null,
    },
  });

  revalidatePath("/environmental/emission-factors");
  revalidatePath("/environmental/carbon");
  return ok(factor);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an emission factor. Admin-only.
 * GUARDED: refuses deletion if any CarbonTransaction references this factor,
 * because deleting it would corrupt historical co2Kg calculations.
 */
export async function deleteEmissionFactor(
  id: string
): Promise<ActionResult<void>> {
  await requireAdmin();

  const txCount = await prisma.carbonTransaction.count({
    where: { emissionFactorId: id },
  });

  if (txCount > 0) {
    return fail(
      `Cannot delete: ${txCount} carbon transaction${txCount === 1 ? "" : "s"} reference this factor. ` +
        "Remove or re-assign those transactions first."
    );
  }

  await prisma.emissionFactor.delete({ where: { id } });

  revalidatePath("/environmental/emission-factors");
  revalidatePath("/environmental/carbon");
  return ok(undefined);
}
