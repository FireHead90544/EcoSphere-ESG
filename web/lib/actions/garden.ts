"use server";

/**
 * Garden Server Actions
 * Covers: getMyGarden, waterTree, applyFertilizer, buyShopItem, plantTree, getMyInventory
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import {
  BuyShopItemSchema,
  PlantTreeSchema,
  WaterTreeSchema,
  FertilizeTreeSchema,
} from "@/lib/schemas/gamification";
import {
  computeWaterLevel,
  computeGrowthScore,
  carePointsToStage,
} from "@/lib/gamification-utils";

// ─── Get or create my garden ──────────────────────────────────────────────────

export async function getMyGarden() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true, ecoCoins: true },
  });
  if (!employee) return null;

  // Get or create garden
  let garden = await prisma.garden.findUnique({
    where: { employeeId: employee.id },
    include: { trees: { orderBy: { plantedAt: "asc" } } },
  });

  if (!garden) {
    garden = await prisma.garden.create({
      data: { employeeId: employee.id },
      include: { trees: { orderBy: { plantedAt: "asc" } } },
    });
  }

  // Compute live water level (lazy decay, no cron)
  const liveWaterLevel = computeWaterLevel(
    garden.waterLevel,
    garden.lastWatered
  );

  return {
    ...garden,
    waterLevel: liveWaterLevel,
    ecoCoins: employee.ecoCoins,
  };
}

// ─── Get inventory ────────────────────────────────────────────────────────────

export async function getMyInventory() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employee) return [];

  // Aggregate total purchased per item
  const purchases = await prisma.inventoryPurchase.groupBy({
    by: ["shopItemId"],
    where: { employeeId: employee.id },
    _sum: { quantity: true },
  });

  // Fetch item details
  const shopItemIds = purchases.map((p) => p.shopItemId);
  const items = await prisma.shopItem.findMany({
    where: { id: { in: shopItemIds } },
  });

  return purchases.map((p) => {
    const item = items.find((i) => i.id === p.shopItemId)!;
    return {
      shopItemId: p.shopItemId,
      name: item.name,
      type: item.type,
      quantity: p._sum.quantity ?? 0,
    };
  });
}

// ─── Buy from shop ────────────────────────────────────────────────────────────

export async function buyShopItem(
  input: unknown
): Promise<ActionResult<{ newCoinBalance: number }>> {
  const session = await requireAuth();

  const parsed = BuyShopItemSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { shopItemId, quantity } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true, ecoCoins: true },
  });
  if (!employee) return fail("Employee record not found");

  const item = await prisma.shopItem.findUnique({ where: { id: shopItemId } });
  if (!item) return fail("Item not found");
  if (item.status !== "ACTIVE") return fail("This item is not available");

  const totalCost = item.costCoins * quantity;
  if (employee.ecoCoins < totalCost) {
    return fail(
      `Insufficient EcoCoins. Need ${totalCost} coins but you have ${employee.ecoCoins}.`
    );
  }

  // Check stock
  if (item.stock !== null && item.stock < quantity) {
    return fail(`Only ${item.stock} in stock.`);
  }

  const [updatedEmployee] = await prisma.$transaction([
    prisma.employee.update({
      where: { id: employee.id },
      data: { ecoCoins: { decrement: totalCost } },
    }),
    prisma.inventoryPurchase.create({
      data: {
        employeeId: employee.id,
        shopItemId,
        quantity,
        totalCost,
      },
    }),
    ...(item.stock !== null
      ? [
          prisma.shopItem.update({
            where: { id: shopItemId },
            data: { stock: { decrement: quantity } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/gamification/garden");
  return ok({ newCoinBalance: updatedEmployee.ecoCoins });
}

// ─── Plant a tree ─────────────────────────────────────────────────────────────

export async function plantTree(
  input: unknown
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const parsed = PlantTreeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { seedShopItemId } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employee) return fail("Employee record not found");

  // Verify the item is a seed
  const shopItem = await prisma.shopItem.findUnique({
    where: { id: seedShopItemId },
  });
  if (!shopItem || shopItem.type !== "SEED") {
    return fail("Selected item is not a seed");
  }

  // Check inventory — need at least 1 of this seed
  const inventoryTotal = await prisma.inventoryPurchase.aggregate({
    where: { employeeId: employee.id, shopItemId: seedShopItemId },
    _sum: { quantity: true },
  });
  // NOTE: simplified — we track purchase totals; a production app would track usage separately.
  // For hackathon demo, just verify at least 1 was ever purchased.
  if ((inventoryTotal._sum.quantity ?? 0) < 1) {
    return fail("You don't have this seed in your inventory. Buy one from the shop.");
  }

  // Get or create garden
  let garden = await prisma.garden.findUnique({
    where: { employeeId: employee.id },
  });
  if (!garden) {
    garden = await prisma.garden.create({
      data: { employeeId: employee.id },
    });
  }

  await prisma.tree.create({
    data: {
      gardenId: garden.id,
      species: shopItem.name.replace(" Seed", ""),
      stage: "SEED",
      carePoints: 0,
    },
  });

  revalidatePath("/gamification/garden");
  return ok(undefined);
}

// ─── Water a tree ─────────────────────────────────────────────────────────────

export async function waterTree(
  input: unknown
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const parsed = WaterTreeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { treeId } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employee) return fail("Employee record not found");

  // Verify the tree belongs to this employee
  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    include: { garden: true },
  });
  if (!tree || tree.garden.employeeId !== employee.id) {
    return fail("Tree not found in your garden");
  }

  // Check water in inventory (simplified: Water Can items)
  const waterCan = await prisma.shopItem.findFirst({
    where: { type: "WATER", status: "ACTIVE" },
  });
  if (!waterCan) return fail("No water items available");

  const waterOwned = await prisma.inventoryPurchase.aggregate({
    where: { employeeId: employee.id, shopItemId: waterCan.id },
    _sum: { quantity: true },
  });
  if ((waterOwned._sum.quantity ?? 0) < 1) {
    return fail("No water cans in inventory. Buy one from the shop first.");
  }

  const newCarePoints = tree.carePoints + 10;
  const newStage = carePointsToStage(newCarePoints);

  await prisma.$transaction([
    prisma.tree.update({
      where: { id: treeId },
      data: {
        carePoints: newCarePoints,
        stage: newStage,
        lastWateredAt: new Date(),
      },
    }),
    // Update garden water level
    prisma.garden.update({
      where: { id: tree.gardenId },
      data: {
        waterLevel: { increment: 15 },
        lastWatered: new Date(),
      },
    }),
  ]);

  // Recompute growthScore
  const updatedTrees = await prisma.tree.findMany({
    where: { gardenId: tree.gardenId },
    select: { stage: true },
  });
  const newGrowthScore = computeGrowthScore(updatedTrees);
  await prisma.garden.update({
    where: { id: tree.gardenId },
    data: { growthScore: newGrowthScore },
  });

  revalidatePath("/gamification/garden");
  revalidatePath("/gamification/leaderboard");
  return ok(undefined);
}

// ─── Fertilize a tree ─────────────────────────────────────────────────────────

export async function fertilizeTree(
  input: unknown
): Promise<ActionResult<void>> {
  const session = await requireAuth();

  const parsed = FertilizeTreeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { treeId } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!employee) return fail("Employee record not found");

  const tree = await prisma.tree.findUnique({
    where: { id: treeId },
    include: { garden: true },
  });
  if (!tree || tree.garden.employeeId !== employee.id) {
    return fail("Tree not found in your garden");
  }

  // Check fertilizer in inventory
  const fertilizer = await prisma.shopItem.findFirst({
    where: { type: "FERTILIZER", status: "ACTIVE" },
  });
  if (!fertilizer) return fail("No fertilizer available");

  const fertOwned = await prisma.inventoryPurchase.aggregate({
    where: { employeeId: employee.id, shopItemId: fertilizer.id },
    _sum: { quantity: true },
  });
  if ((fertOwned._sum.quantity ?? 0) < 1) {
    return fail("No fertilizer in inventory. Buy some from the shop first.");
  }

  const newCarePoints = tree.carePoints + 20;
  const newStage = carePointsToStage(newCarePoints);

  await prisma.tree.update({
    where: { id: treeId },
    data: { carePoints: newCarePoints, stage: newStage },
  });

  // Recompute growthScore
  const updatedTrees = await prisma.tree.findMany({
    where: { gardenId: tree.gardenId },
    select: { stage: true },
  });
  const newGrowthScore = computeGrowthScore(updatedTrees);
  await prisma.garden.update({
    where: { id: tree.gardenId },
    data: { growthScore: newGrowthScore },
  });

  revalidatePath("/gamification/garden");
  return ok(undefined);
}

// ─── Get shop items ───────────────────────────────────────────────────────────

export async function getShopItems() {
  await requireAuth();
  return prisma.shopItem.findMany({
    where: { status: "ACTIVE" },
    orderBy: { costCoins: "asc" },
  });
}
