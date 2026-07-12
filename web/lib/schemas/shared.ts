// Shared Zod primitives — import these in module-specific schemas
// to keep validation consistent across all Server Actions

import { z } from "zod";

// ─── Primitive helpers ────────────────────────────────────────────────────────

/** Valid CUID string (Prisma @default(cuid())) */
export const zCuid = z.string().cuid("Invalid ID format");

/** Optional CUID — for nullable FK fields */
export const zCuidOptional = zCuid.optional();

/** Date coerced from string (form inputs send strings) */
export const zDate = z.coerce.date();

/** Future date — for due dates, deadlines */
export const zFutureDate = z.coerce.date().refine(
  (d) => d > new Date(),
  { message: "Date must be in the future" }
);

/** Non-empty trimmed string */
export const zStr = (min = 1, max = 1000) =>
  z.string().min(min, `Minimum ${min} character(s) required`).max(max).trim();

/** URL string — for proof uploads */
export const zUrl = z.string().url("Must be a valid URL").optional();

// ─── Common response type ─────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Helper to create a success result */
export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/** Helper to create a failure result from a Zod error */
export function fail(message: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { success: false, error: message, fieldErrors };
}

/** Helper to create a failure from a Zod parse error */
export function fromZodError(err: import("zod").ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fail("Validation failed", fieldErrors);
}
