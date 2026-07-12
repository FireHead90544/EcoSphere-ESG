import { requireAdmin } from "@/lib/auth-utils";
import { NewPolicyForm } from "./NewPolicyForm";

export const metadata = { title: "New Policy — Governance | EcoSphere" };

export default async function NewPolicyPage() {
  await requireAdmin();
  return <NewPolicyForm />;
}
