import { z } from "zod";
import { zCuid, zCuidOptional, zStr, zFutureDate } from "@/lib/schemas/shared";

// ─── Policies ─────────────────────────────────────────────────────────────────

export const PolicySchema = z.object({
  title: zStr(3, 200),
  body: zStr(10, 20000),
});

export type PolicyInput = z.infer<typeof PolicySchema>;

// ─── Audits ───────────────────────────────────────────────────────────────────

export const AuditSchema = z.object({
  title: zStr(3, 200),
  departmentId: zCuid,
  auditorName: zStr(2, 100),
  date: z.coerce.date(),
  findingsSummary: z.string().max(5000).optional(),
  status: z.enum(["SCHEDULED", "COMPLETED", "UNDER_REVIEW"]),
});

export type AuditInput = z.infer<typeof AuditSchema>;

// ─── Compliance Issues ────────────────────────────────────────────────────────

export const ComplianceIssueSchema = z.object({
  auditId: zCuidOptional,
  departmentId: zCuidOptional,
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: zStr(10, 5000),
  ownerId: zCuid,
  dueDate: z.coerce.date().refine(
    (d) => d > new Date(),
    { message: "Due date must be in the future" }
  ),
});

export type ComplianceIssueInput = z.infer<typeof ComplianceIssueSchema>;
