import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NewComplianceIssueForm } from "./NewComplianceIssueForm";

export const metadata = { title: "Raise Issue — Governance | EcoSphere" };

export default async function NewComplianceIssuePage() {
  await requireAdmin();
  const [departments, audits, employees] = await Promise.all([
    prisma.department.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.audit.findMany({ orderBy: { date: "desc" }, take: 20, select: { id: true, title: true } }),
    prisma.employee.findMany({
      orderBy: { name: "asc" },
      select: { userId: true, name: true, department: { select: { name: true } } },
    }),
  ]);
  return (
    <NewComplianceIssueForm
      departments={departments}
      audits={audits}
      employees={employees.map((e) => ({ userId: e.userId, name: e.name, departmentName: e.department?.name ?? null }))}
    />
  );
}
