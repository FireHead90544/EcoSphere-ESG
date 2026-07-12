import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { NewAuditForm } from "./NewAuditForm";

export const metadata = { title: "New Audit — Governance | EcoSphere" };

export default async function NewAuditPage() {
  await requireAdmin();
  const departments = await prisma.department.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <NewAuditForm departments={departments} />;
}
