import { requireAdmin } from "@/lib/auth-utils";
import { getUsers } from "@/lib/actions/settings";
import { prisma } from "@/lib/prisma";
import { UserManagement } from "@/app/(dashboard)/settings/users/UserManagement";

export const metadata = { title: "Users — Settings | EcoSphere" };

export default async function UsersPage() {
  await requireAdmin();
  const [users, departments] = await Promise.all([
    getUsers(),
    prisma.department.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return <UserManagement users={users} departments={departments} />;
}
