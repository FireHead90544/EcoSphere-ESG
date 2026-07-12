import { requireAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { headers } from "next/headers";
import { Building2, Tag, Users, SlidersHorizontal, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings/departments", label: "Departments", icon: Building2 },
  { href: "/settings/categories", label: "Categories", icon: Tag },
  { href: "/settings/users", label: "Users", icon: Users },
  { href: "/settings/esg-config", label: "ESG Config", icon: SlidersHorizontal },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";

  return (
    <div className="space-y-6">
      {/* Settings header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 border border-border">
          <Settings className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Settings</h1>
          <p className="text-xs text-muted-foreground">Admin only — platform configuration</p>
        </div>
      </div>

      {/* Tab nav */}
      <nav className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* Tab content */}
      <div>{children}</div>
    </div>
  );
}
