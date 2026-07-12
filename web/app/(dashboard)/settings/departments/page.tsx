import { requireAdmin } from "@/lib/auth-utils";
import { getDepartments } from "@/lib/actions/settings";
import { DeptManagement } from "@/app/(dashboard)/settings/departments/DeptManagement";

export const metadata = { title: "Departments — Settings | EcoSphere" };

export default async function DepartmentsPage() {
  await requireAdmin();
  const departments = await getDepartments();
  return <DeptManagement departments={departments} />;
}
