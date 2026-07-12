import { redirect } from "next/navigation";

// /settings → redirect to departments (default tab)
export default function SettingsRootPage() {
  redirect("/settings/departments");
}
