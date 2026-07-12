/**
 * Gamification Zod Schemas
 * Shared between client-side react-hook-form resolvers and Server Action validation.
 * Import these instead of defining inline schemas — one source of truth.
 */

import { z } from "zod";
import { zCuid, zStr, zFutureDate } from "@/lib/schemas/shared";

// ─── Challenges ───────────────────────────────────────────────────────────────

export const CreateChallengeSchema = z.object({
  title: zStr(3, 120),
  categoryId: zCuid,
  description: zStr(10, 2000),
  xp: z.coerce
    .number()
    .int("XP must be a whole number")
    .min(10, "Minimum 10 XP")
    .max(10000, "Maximum 10,000 XP"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  evidenceRequired: z.coerce.boolean().default(true),
  deadline: zFutureDate,
});

export type CreateChallengeInput = z.infer<typeof CreateChallengeSchema>;

export const UpdateChallengeSchema = CreateChallengeSchema.partial().extend({
  id: zCuid,
});

export type UpdateChallengeInput = z.infer<typeof UpdateChallengeSchema>;

export const SetChallengeStatusSchema = z.object({
  id: zCuid,
  status: z.enum(["DRAFT", "ACTIVE", "UNDER_REVIEW", "COMPLETED", "ARCHIVED"]),
});

// ─── Challenge Participation ──────────────────────────────────────────────────

export const JoinChallengeSchema = z.object({
  challengeId: zCuid,
});

export const SubmitChallengeProofSchema = z.object({
  participationId: zCuid,
  proofUrl: z
    .string()
    .min(1, "Proof file path is required")
    .optional()
    .or(z.literal("")),
});

export const ApproveChallengeParticipationSchema = z.object({
  participationId: zCuid,
  action: z.enum(["APPROVE", "REJECT"]),
});

// ─── Shop & Garden ────────────────────────────────────────────────────────────

export const BuyShopItemSchema = z.object({
  shopItemId: zCuid,
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Minimum quantity is 1")
    .max(99, "Maximum 99 per transaction"),
});

export type BuyShopItemInput = z.infer<typeof BuyShopItemSchema>;

export const PlantTreeSchema = z.object({
  seedShopItemId: zCuid, // must be a SEED type item
});

export const WaterTreeSchema = z.object({
  treeId: zCuid,
});

export const FertilizeTreeSchema = z.object({
  treeId: zCuid,
});

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const RedeemRewardSchema = z.object({
  rewardId: zCuid,
});

// ─── Reports (Custom Builder Filters) ────────────────────────────────────────

export const CustomReportFiltersSchema = z.object({
  departmentId: zCuid.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  module: z
    .enum(["environmental", "social", "governance", "gamification"])
    .optional(),
  employeeId: zCuid.optional(),
  challengeId: zCuid.optional(),
  esgCategory: z.string().optional(),
});

export type CustomReportFilters = z.infer<typeof CustomReportFiltersSchema>;

export const ReportExportSchema = z.object({
  type: z.enum([
    "environmental",
    "social",
    "governance",
    "esg-summary",
    "custom",
  ]),
  format: z.enum(["pdf", "xlsx", "csv"]),
  filters: CustomReportFiltersSchema.optional(),
});

export type ReportExportInput = z.infer<typeof ReportExportSchema>;
