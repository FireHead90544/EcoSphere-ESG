"use client";

import Link from "next/link";
import { Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface TopbarProps {
  userId: string;
}

export function Topbar({ userId }: TopbarProps) {
  const { theme, setTheme } = useTheme();

  // Poll unread notification count every 10s
  const { data } = useSWR<{ count: number }>(
    `/api/notifications/unread-count?userId=${userId}`,
    fetcher,
    { refreshInterval: 10000, revalidateOnFocus: true }
  );

  const unreadCount = data?.count ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-sm px-4 lg:px-6">
      {/* Sidebar toggle (mobile) */}
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        {/* Notifications bell */}
        <Link
          href="/notifications"
          className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 py-0 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Link>
      </div>
    </header>
  );
}
