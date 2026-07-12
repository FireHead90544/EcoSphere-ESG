import { requireAdmin } from "@/lib/auth-utils";
import { getCategories } from "@/lib/actions/settings";
import { CategoryManagement } from "@/app/(dashboard)/settings/categories/CategoryManagement";

export const metadata = { title: "Categories — Settings | EcoSphere" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await getCategories();
  return <CategoryManagement categories={categories} />;
}
