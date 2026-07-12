// EcoSphere — Environmental Module Zod Schemas
// Shared between client-side forms and server-side validation in Server Actions.
// All schemas use primitives from @/lib/schemas/shared.

import { z } from "zod";
import { zCuid, zStr, zDate, zFutureDate } from "@/lib/schemas/shared";

// ─── Emission Factor ─────────────────────────────────────────────────────────

export const EmissionFactorSchema = z.object({
  activity:    zStr(1, 200),  // e.g. "Diesel (litre)", "Electricity (kWh)"
  factorKgCO2: z.coerce.number().positive("Factor must be greater than 0"),
  unit:        zStr(1, 50),   // e.g. "litre", "kWh", "km"
  source:      z.string().max(200).trim().optional(),
});

export type EmissionFactorInput = z.output<typeof EmissionFactorSchema>;

// ─── Product ESG Profile ──────────────────────────────────────────────────────

export const ProductESGProfileSchema = z.object({
  productName: zStr(1, 200),
  co2PerUnit:  z.coerce.number().min(0, "CO₂ per unit cannot be negative"),
  recyclable:  z.boolean().default(false),
  notes:       z.string().max(500).trim().optional(),
});

export type ProductESGProfileInput = z.output<typeof ProductESGProfileSchema>;

// ─── Carbon Transaction ───────────────────────────────────────────────────────

export const CarbonTransactionSchema = z.object({
  departmentId:     zCuid,
  sourceType:       z.enum(["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"]).refine(
    (v) => ["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"].includes(v),
    { message: "Select a valid source type" }
  ),
  quantity:         z.coerce.number().positive("Quantity must be greater than 0"),
  emissionFactorId: zCuid,
  // date cannot be in the future — carbon already happened
  date:             zDate.refine(
    (d) => d <= new Date(),
    { message: "Date cannot be in the future" }
  ),
  notes:            z.string().max(500).trim().optional(),
});
// Note: co2Kg is NOT in this schema — it is computed server-side as quantity × factor.factorKgCO2

export type CarbonTransactionInput = z.output<typeof CarbonTransactionSchema>;

// ─── Carbon Transaction Filter ────────────────────────────────────────────────

export const CarbonTransactionFilterSchema = z.object({
  departmentId: zCuid.optional(),
  sourceType:   z.enum(["PURCHASE", "MANUFACTURING", "EXPENSE", "FLEET", "MANUAL"]).optional(),
  dateFrom:     zDate.optional(),
  dateTo:       zDate.optional(),
}).refine(
  (d) => !d.dateFrom || !d.dateTo || d.dateFrom <= d.dateTo,
  { message: "Start date must be before end date", path: ["dateFrom"] }
);

export type CarbonTransactionFilter = z.infer<typeof CarbonTransactionFilterSchema>;

// ─── Environmental Goal ───────────────────────────────────────────────────────

export const EnvironmentalGoalSchema = z.object({
  name:         zStr(1, 200),
  departmentId: zCuid,
  targetCO2Kg:  z.coerce.number().positive("Target must be greater than 0"),
  deadline:     zFutureDate,
});

export const EnvironmentalGoalUpdateSchema = EnvironmentalGoalSchema.partial().extend({
  status: z.enum(["ACTIVE", "ON_TRACK", "AT_RISK", "COMPLETED"]).optional(),
});

export type EnvironmentalGoalInput = z.output<typeof EnvironmentalGoalSchema>;

// ─── Report Filters ───────────────────────────────────────────────────────────

export const EnvironmentalReportFilterSchema = z.object({
  departmentId: zCuid.optional(),
  dateFrom:     zDate,
  dateTo:       zDate,
}).refine(
  (d) => d.dateFrom <= d.dateTo,
  { message: "Start date must be before end date", path: ["dateFrom"] }
);

export type EnvironmentalReportFilter = z.infer<typeof EnvironmentalReportFilterSchema>;
