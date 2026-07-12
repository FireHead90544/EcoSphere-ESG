import { redirect } from "next/navigation";

// Root "/" redirects to /dashboard (which requires auth — middleware handles the rest)
export default function RootPage() {
  redirect("/dashboard");
}
