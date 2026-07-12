"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import {
  DepartmentSchema, CategorySchema, CreateUserSchema, ESGConfigSchema,
  type DepartmentInput, type CategoryInput, type CreateUserInput, type ESGConfigInput,
} from "@/lib/schemas/settings";

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { name: true } },
      _count: { select: { employees: true } },
    },
  });
}


export async function createDepartment(data: DepartmentInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = DepartmentSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const dept = await prisma.department.create({ data: parsed.data });
  revalidatePath("/settings/departments");
  return ok({ id: dept.id });
}

export async function updateDepartment(id: string, data: DepartmentInput): Promise<ActionResult<void>> {
  await requireAdmin();
  const parsed = DepartmentSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.department.update({ where: { id }, data: parsed.data });
  revalidatePath("/settings/departments");
  return ok(undefined);
}

export async function deleteDepartment(id: string): Promise<ActionResult<void>> {
  await requireAdmin();

  const empCount = await prisma.employee.count({ where: { departmentId: id } });
  if (empCount > 0) {
    return fail(`Cannot delete — ${empCount} employee${empCount > 1 ? "s" : ""} are assigned to this department.`);
  }

  await prisma.department.delete({ where: { id } });
  revalidatePath("/settings/departments");
  return ok(undefined);
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
}

export async function createCategory(data: CategoryInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const cat = await prisma.category.create({
    data: { name: parsed.data.name, type: parsed.data.type as "CSR_ACTIVITY" | "CHALLENGE", status: parsed.data.status },
  });

  revalidatePath("/settings/categories");
  return ok({ id: cat.id });
}

export async function updateCategory(id: string, data: CategoryInput): Promise<ActionResult<void>> {
  await requireAdmin();
  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, type: parsed.data.type as "CSR_ACTIVITY" | "CHALLENGE", status: parsed.data.status },
  });

  revalidatePath("/settings/categories");
  return ok(undefined);
}

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/settings/categories");
  return ok(undefined);
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        include: { department: { select: { name: true } } },
      },
    },
  });
}

export async function createUser(data: CreateUserInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = CreateUserSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return fail("An account with this email already exists.");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      employee: {
        create: {
          name: parsed.data.name,
          // departmentId is required in schema — only create employee if a dept is selected,
          // otherwise create user without employee record and link later
          ...(parsed.data.departmentId
            ? { departmentId: parsed.data.departmentId }
            : { departmentId: "" }), // Will be updated when dept is assigned
        },
      },

    },
  });

  revalidatePath("/settings/users");
  return ok({ id: user.id });
}

export async function updateUserRole(
  id: string,
  role: "ADMIN" | "EMPLOYEE" | "DEPT_HEAD"
): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/settings/users");
  return ok(undefined);
}

// ─── ESG CONFIG ───────────────────────────────────────────────────────────────

export async function getESGConfig() {
  return prisma.eSGConfig.findFirst();
}

export async function updateESGConfig(data: ESGConfigInput): Promise<ActionResult<void>> {
  await requireAdmin();
  const parsed = ESGConfigSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  // Singleton upsert — always update the first row (id from seed = "singleton")
  const existing = await prisma.eSGConfig.findFirst();
  if (existing) {
    await prisma.eSGConfig.update({ where: { id: existing.id }, data: parsed.data });
  } else {
    await prisma.eSGConfig.create({ data: { ...parsed.data, id: "singleton" } });
  }

  revalidatePath("/settings/esg-config");
  revalidatePath("/dashboard");
  return ok(undefined);
}
