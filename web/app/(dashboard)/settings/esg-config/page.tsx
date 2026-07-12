import { requireAdmin } from "@/lib/auth-utils";
import { getESGConfig } from "@/lib/actions/settings";
import { ESGConfigPanel } from "./ESGConfigPanel";

export const metadata = { title: "ESG Configuration — Settings | EcoSphere" };

export default async function ESGConfigPage() {
  await requireAdmin();
  const config = await getESGConfig();
  return <ESGConfigPanel config={config} />;
}
