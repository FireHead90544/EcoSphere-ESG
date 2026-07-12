"use server";

// Environmental Module — Product ESG Profiles Server Actions
// Owner: Team A (Environmental)

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import { ProductESGProfileSchema } from "@/lib/schemas/environmental";
import type { ProductESGProfile } from "@/lib/generated/prisma/client";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProductESGProfiles(): Promise<ProductESGProfile[]> {
  await requireAuth();
  return prisma.productESGProfile.findMany({
    orderBy: { productName: "asc" },
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProductESGProfile(
  data: unknown
): Promise<ActionResult<ProductESGProfile>> {
  await requireAdmin();

  const parsed = ProductESGProfileSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { productName, co2PerUnit, recyclable, notes } = parsed.data;

  // Uniqueness check
  const allProfiles = await prisma.productESGProfile.findMany({ select: { id: true, productName: true } });
  const existing = allProfiles.find((p) => p.productName.toLowerCase() === productName.toLowerCase());
  if (existing) {
    return fail("A product with this name already exists.");
  }

  const profile = await prisma.productESGProfile.create({
    data: { productName, co2PerUnit, recyclable, notes: notes ?? null },
  });

  revalidatePath("/environmental/products");
  return ok(profile);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProductESGProfile(
  id: string,
  data: unknown
): Promise<ActionResult<ProductESGProfile>> {
  await requireAdmin();

  const parsed = ProductESGProfileSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const { productName, co2PerUnit, recyclable, notes } = parsed.data;

  const allProfiles = await prisma.productESGProfile.findMany({ select: { id: true, productName: true } });
  const existing = allProfiles.find(
    (p) => p.productName.toLowerCase() === productName.toLowerCase() && p.id !== id
  );
  if (existing) return fail("A product with this name already exists.");

  const profile = await prisma.productESGProfile.update({
    where: { id },
    data: { productName, co2PerUnit, recyclable, notes: notes ?? null },
  });

  revalidatePath("/environmental/products");
  return ok(profile);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProductESGProfile(
  id: string
): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.productESGProfile.delete({ where: { id } });
  revalidatePath("/environmental/products");
  return ok(undefined);
}
