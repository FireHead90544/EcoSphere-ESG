import { z } from "zod";
import { zCuid, zCuidOptional, zStr } from "@/lib/schemas/shared";

// ─── Department ───────────────────────────────────────────────────────────────

export const DepartmentSchema = z.object({
  name: zStr(2, 100),
  code: z.string().min(1).max(10).toUpperCase().trim(),
  headId: zCuidOptional,
  parentId: zCuidOptional,
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type DepartmentInput = z.infer<typeof DepartmentSchema>;

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  name: zStr(2, 100),
  type: z.enum(["CSR_ACTIVITY", "CHALLENGE"]),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});


export type CategoryInput = z.infer<typeof CategorySchema>;

// ─── Create User ──────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  name: zStr(2, 100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "EMPLOYEE", "DEPT_HEAD"]).default("EMPLOYEE"),
  departmentId: zCuidOptional,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;


// ─── ESG Config ───────────────────────────────────────────────────────────────

export const ESGConfigSchema = z
  .object({
    envWeight: z.number().min(0.1).max(0.9),
    socialWeight: z.number().min(0.1).max(0.9),
    govWeight: z.number().min(0.1).max(0.9),
    autoEmission: z.boolean(),
    requireEvidence: z.boolean(),
    autoBadgeAward: z.boolean(),
    emailAlerts: z.boolean(),
  })
  .refine(
    (d) => Math.abs(d.envWeight + d.socialWeight + d.govWeight - 1.0) < 0.001,
    { message: "Environmental + Social + Governance weights must sum to 100%" }
  );

export type ESGConfigInput = z.infer<typeof ESGConfigSchema>;
