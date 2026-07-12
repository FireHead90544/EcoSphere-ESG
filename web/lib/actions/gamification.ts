"use server";

/**
 * Gamification Server Actions
 * Covers: Challenges, Participation, XP/Badge award, Leaderboard, Rewards
 *
 * Rules (AGENTS.md):
 * - requireAuth() / requireAdmin() at top of every action
 * - Validate with Zod, return ActionResult<T>
 * - Use createNotification() from @/lib/actions/notifications — never direct prisma.notification
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth-utils";
import {
  ok,
  fail,
  fromZodError,
  type ActionResult,
} from "@/lib/schemas/shared";
import {
  CreateChallengeSchema,
  UpdateChallengeSchema,
  SetChallengeStatusSchema,
  JoinChallengeSchema,
  SubmitChallengeProofSchema,
  ApproveChallengeParticipationSchema,
  RedeemRewardSchema,
} from "@/lib/schemas/gamification";
import { createNotification } from "@/lib/actions/notifications";
import {
  calcLevel,
  parseBadgeRule,
  checkBadgeRule,
} from "@/lib/gamification-utils";
import type {
  Challenge,
  ChallengeParticipation,
  ChallengeStatus,
} from "@/lib/generated/prisma/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getESGConfig() {
  return prisma.eSGConfig.findFirst({ where: { id: "singleton" } });
}

// ─── Challenge CRUD ───────────────────────────────────────────────────────────

export async function createChallenge(
  input: unknown
): Promise<ActionResult<Challenge>> {
  await requireAdmin();
  const session = await requireAuth();

  const parsed = CreateChallengeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const challenge = await prisma.challenge.create({
    data: {
      title: data.title,
      categoryId: data.categoryId,
      description: data.description,
      xp: data.xp,
      difficulty: data.difficulty,
      evidenceRequired: data.evidenceRequired,
      deadline: data.deadline,
      status: "DRAFT",
      createdBy: session.user.id,
    },
  });

  revalidatePath("/gamification/challenges");
  return ok(challenge);
}

export async function updateChallenge(
  input: unknown
): Promise<ActionResult<Challenge>> {
  await requireAdmin();

  const parsed = UpdateChallengeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { id, ...data } = parsed.data;

  const existing = await prisma.challenge.findUnique({ where: { id } });
  if (!existing) return fail("Challenge not found");
  if (existing.status !== "DRAFT") {
    return fail("Only DRAFT challenges can be edited");
  }

  const challenge = await prisma.challenge.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.description && { description: data.description }),
      ...(data.xp !== undefined && { xp: data.xp }),
      ...(data.difficulty && { difficulty: data.difficulty }),
      ...(data.evidenceRequired !== undefined && {
        evidenceRequired: data.evidenceRequired,
      }),
      ...(data.deadline && { deadline: data.deadline }),
    },
  });

  revalidatePath("/gamification/challenges");
  return ok(challenge);
}

export async function deleteChallenge(
  id: string
): Promise<ActionResult<void>> {
  await requireAdmin();

  const existing = await prisma.challenge.findUnique({ where: { id } });
  if (!existing) return fail("Challenge not found");
  if (!["DRAFT", "ARCHIVED"].includes(existing.status)) {
    return fail("Only DRAFT or ARCHIVED challenges can be deleted");
  }

  await prisma.challenge.delete({ where: { id } });
  revalidatePath("/gamification/challenges");
  return ok(undefined);
}

export async function setChallengeStatus(
  input: unknown
): Promise<ActionResult<Challenge>> {
  await requireAdmin();

  const parsed = SetChallengeStatusSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { id, status } = parsed.data;

  // Valid transitions
  const existing = await prisma.challenge.findUnique({ where: { id } });
  if (!existing) return fail("Challenge not found");

  const validTransitions: Record<ChallengeStatus, ChallengeStatus[]> = {
    DRAFT: ["ACTIVE", "ARCHIVED"],
    ACTIVE: ["UNDER_REVIEW", "ARCHIVED"],
    UNDER_REVIEW: ["COMPLETED", "ACTIVE", "ARCHIVED"],
    COMPLETED: ["ARCHIVED"],
    ARCHIVED: [],
  };

  if (!validTransitions[existing.status].includes(status)) {
    return fail(
      `Cannot transition from ${existing.status} to ${status}`
    );
  }

  const challenge = await prisma.challenge.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/gamification/challenges");
  return ok(challenge);
}

export async function listChallenges(filters?: {
  status?: ChallengeStatus;
  categoryId?: string;
}) {
  await requireAuth();

  return prisma.challenge.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
    },
    include: {
      category: true,
      _count: { select: { participations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChallenge(id: string) {
  await requireAuth();

  return prisma.challenge.findUnique({
    where: { id },
    include: {
      category: true,
      participations: {
        include: {
          employee: {
            include: { user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// ─── Participation ────────────────────────────────────────────────────────────

export async function joinChallenge(
  input: unknown
): Promise<ActionResult<ChallengeParticipation>> {
  const session = await requireAuth();

  const parsed = JoinChallengeSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { challengeId } = parsed.data;

  // Must be an employee
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) return fail("Employee record not found for your account");

  // Challenge must be ACTIVE
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) return fail("Challenge not found");
  if (challenge.status !== "ACTIVE") {
    return fail("This challenge is not currently active");
  }

  // No duplicate joins
  const existing = await prisma.challengeParticipation.findUnique({
    where: { challengeId_employeeId: { challengeId, employeeId: employee.id } },
  });
  if (existing) return fail("You have already joined this challenge");

  const participation = await prisma.challengeParticipation.create({
    data: {
      challengeId,
      employeeId: employee.id,
      progress: 0,
      approval: "PENDING",
      xpAwarded: 0,
    },
  });

  revalidatePath("/gamification/challenges");
  revalidatePath("/gamification/participation");
  return ok(participation);
}

export async function submitChallengeProof(
  input: unknown
): Promise<ActionResult<ChallengeParticipation>> {
  const session = await requireAuth();

  const parsed = SubmitChallengeProofSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { participationId, proofUrl } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) return fail("Employee record not found");

  const participation = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true },
  });
  if (!participation) return fail("Participation not found");
  if (participation.employeeId !== employee.id) {
    return fail("You can only submit proof for your own participation");
  }
  if (participation.challenge.evidenceRequired && !proofUrl) {
    return fail("This challenge requires evidence — please attach a file");
  }

  const updated = await prisma.challengeParticipation.update({
    where: { id: participationId },
    data: {
      proofUrl: proofUrl || null,
      progress: 100,
      completedAt: new Date(),
    },
  });

  revalidatePath("/gamification/participation");
  return ok(updated);
}

export async function approveChallengeParticipation(
  input: unknown
): Promise<ActionResult<void>> {
  const session = await requireAdmin();

  const parsed = ApproveChallengeParticipationSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { participationId, action } = parsed.data;

  const participation = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: {
      challenge: true,
      employee: { include: { user: true } },
    },
  });
  if (!participation) return fail("Participation not found");

  if (action === "APPROVE") {
    const xpToAward = participation.challenge.xp;

    await prisma.challengeParticipation.update({
      where: { id: participationId },
      data: {
        approval: "APPROVED",
        xpAwarded: xpToAward,
        reviewedBy: session.user.id,
      },
    });

    await awardXP(participation.employeeId, xpToAward);

    await createNotification({
      userId: participation.employee.userId,
      type: "CHALLENGE_APPROVAL",
      title: "Challenge approved",
      body: `Your participation in "${participation.challenge.title}" was approved. You earned ${xpToAward} XP.`,
      link: `/gamification/challenges/${participation.challengeId}`,
    });
  } else {
    await prisma.challengeParticipation.update({
      where: { id: participationId },
      data: { approval: "REJECTED", reviewedBy: session.user.id },
    });

    await createNotification({
      userId: participation.employee.userId,
      type: "CHALLENGE_APPROVAL",
      title: "Challenge submission not approved",
      body: `Your submission for "${participation.challenge.title}" was not approved. Please review and resubmit if eligible.`,
      link: `/gamification/challenges/${participation.challengeId}`,
    });
  }

  revalidatePath("/gamification/participation");
  revalidatePath("/gamification/challenges");
  return ok(undefined);
}

export async function getParticipationQueue() {
  await requireAdmin();

  return prisma.challengeParticipation.findMany({
    where: { approval: "PENDING" },
    include: {
      challenge: { select: { title: true, xp: true, evidenceRequired: true } },
      employee: {
        include: {
          user: { select: { email: true } },
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMyParticipations() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) return [];

  return prisma.challengeParticipation.findMany({
    where: { employeeId: employee.id },
    include: {
      challenge: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── XP Award & Badge Auto-Award (internal helpers) ──────────────────────────

/**
 * Award XP (and equivalent EcoCoins) to an employee.
 * Updates xp, ecoCoins, and level atomically, then checks badge rules.
 */
async function awardXP(employeeId: string, xp: number) {
  const config = await getESGConfig();
  const coinRatio = config?.xpToCoinRatio ?? 1;

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      xp: { increment: xp },
      ecoCoins: { increment: Math.floor(xp * coinRatio) },
    },
  });

  // Recalculate level
  const newLevel = calcLevel(updated.xp);
  if (newLevel !== updated.level) {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { level: newLevel },
    });
  }

  // Trigger badge check
  if (config?.autoBadgeAward) {
    await checkAndAwardBadges(employeeId, updated.xp);
  }
}

/**
 * Check all badge rules for an employee and auto-award any newly earned badges.
 */
async function checkAndAwardBadges(employeeId: string, currentXP: number) {
  const [allBadges, earnedBadges, challengesCompleted, csrCompleted] =
    await Promise.all([
      prisma.badge.findMany(),
      prisma.employeeBadge.findMany({
        where: { employeeId },
        select: { badgeId: true },
      }),
      prisma.challengeParticipation.count({
        where: { employeeId, approval: "APPROVED" },
      }),
      prisma.employeeParticipation.count({
        where: { employeeId, approval: "APPROVED" },
      }),
    ]);

  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));
  const stats = { xp: currentXP, challengesCompleted, csrCompleted };

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    const rule = parseBadgeRule(badge.unlockRule);
    if (!rule) continue;

    if (checkBadgeRule(rule, stats)) {
      await prisma.employeeBadge.create({
        data: { employeeId, badgeId: badge.id },
      });

      // Notify employee — need their userId
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { userId: true },
      });
      if (employee) {
        await createNotification({
          userId: employee.userId,
          type: "BADGE_UNLOCK",
          title: `Badge unlocked: ${badge.name}`,
          body: badge.description,
          link: "/gamification/badges",
        });
      }
    }
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export async function getXPLeaderboard() {
  await requireAuth();

  const employees = await prisma.employee.findMany({
    orderBy: { xp: "desc" },
    take: 50,
    include: {
      user: { select: { email: true } },
      department: { select: { name: true, code: true } },
      badges: { select: { badgeId: true } },
    },
  });

  return employees.map((emp, index) => ({
    rank: index + 1,
    id: emp.id,
    userId: emp.userId,
    name: emp.name,
    email: emp.user.email,
    department: emp.department.name,
    deptCode: emp.department.code,
    xp: emp.xp,
    level: emp.level,
    badgeCount: emp.badges.length,
  }));
}

export async function getGardenLeaderboard() {
  await requireAuth();

  const gardens = await prisma.garden.findMany({
    orderBy: { growthScore: "desc" },
    take: 50,
    include: {
      employee: {
        include: {
          user: { select: { email: true } },
          department: { select: { name: true, code: true } },
        },
      },
      trees: { select: { stage: true } },
    },
  });

  return gardens.map((g, index) => ({
    rank: index + 1,
    gardenId: g.id,
    employeeId: g.employeeId,
    employeeName: g.employee.name,
    department: g.employee.department.name,
    growthScore: g.growthScore,
    treeCount: g.trees.length,
    matureTrees: g.trees.filter((t) => t.stage === "MATURE").length,
  }));
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export async function getAllBadgesWithStatus() {
  const session = await requireAuth();

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const [allBadges, earned] = await Promise.all([
    prisma.badge.findMany({ orderBy: { createdAt: "asc" } }),
    employee
      ? prisma.employeeBadge.findMany({
          where: { employeeId: employee.id },
          select: { badgeId: true, unlockedAt: true },
        })
      : [],
  ]);

  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.unlockedAt]));

  return allBadges.map((badge) => ({
    ...badge,
    isUnlocked: earnedMap.has(badge.id),
    unlockedAt: earnedMap.get(badge.id) ?? null,
  }));
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export async function getRewards() {
  await requireAuth();

  return prisma.reward.findMany({
    where: { status: "ACTIVE" },
    orderBy: { pointsRequired: "asc" },
    include: {
      _count: { select: { redemptions: true } },
    },
  });
}

export async function redeemReward(
  input: unknown
): Promise<ActionResult<{ newXP: number; newCoins: number }>> {
  const session = await requireAuth();

  const parsed = RedeemRewardSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { rewardId } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });
  if (!employee) return fail("Employee record not found");

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) return fail("Reward not found");
  if (reward.status !== "ACTIVE") return fail("This reward is no longer available");

  // Stock check (stock -1 = unlimited per seed)
  if (reward.stock !== null && reward.stock !== -1 && reward.stock <= 0) {
    return fail("This reward is out of stock");
  }

  // XP balance check
  if (employee.xp < reward.pointsRequired) {
    return fail(
      `Insufficient XP. You need ${reward.pointsRequired} XP but have ${employee.xp}.`
    );
  }

  // Deduct XP and create redemption record
  const [updated] = await prisma.$transaction([
    prisma.employee.update({
      where: { id: employee.id },
      data: { xp: { decrement: reward.pointsRequired } },
    }),
    prisma.rewardRedemption.create({
      data: { employeeId: employee.id, rewardId },
    }),
    // Decrement stock if finite
    ...(reward.stock !== null && reward.stock !== -1
      ? [
          prisma.reward.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } },
          }),
        ]
      : []),
  ]);

  revalidatePath("/gamification/rewards");
  return ok({ newXP: updated.xp, newCoins: updated.ecoCoins });
}
