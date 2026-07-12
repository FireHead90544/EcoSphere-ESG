"use client";

import { useTransition } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  FileText,
  Trophy,
  Info,
  ExternalLink,
  Check,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import { useRouter } from "next/navigation";
import type { Notification, NotifType } from "@/lib/generated/prisma/client";

// ─── Icon map by notification type ───────────────────────────────────────────

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  COMPLIANCE_ISSUE: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  CSR_APPROVAL: { icon: CheckCircle, color: "text-[--esg-social]", bg: "bg-[--esg-social]/10" },
  CHALLENGE_APPROVAL: { icon: Trophy, color: "text-[--score-gold]", bg: "bg-[--score-gold]/10" },
  POLICY_REMINDER: { icon: FileText, color: "text-[--esg-gov]", bg: "bg-[--esg-gov]/10" },
  BADGE_UNLOCK: { icon: Trophy, color: "text-[--score-gold]", bg: "bg-[--score-gold]/10" },
  GENERAL: { icon: Info, color: "text-muted-foreground", bg: "bg-muted/30" },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Single notification row ──────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  const cfg = typeConfig[notification.type] ?? typeConfig.GENERAL;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border border-border p-4 transition-colors",
        notification.read ? "bg-card opacity-70" : "bg-card border-l-4 border-l-primary/50"
      )}
    >
      {/* Icon */}
      <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
        <Icon className={cn("size-4.5", cfg.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", notification.read ? "text-muted-foreground" : "text-foreground")}>
            {notification.title}
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground font-mono">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notification.body}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          {notification.link && (
            <Link
              href={notification.link}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              onClick={() => !notification.read && onRead(notification.id)}
            >
              <ExternalLink className="size-3" />
              View details
            </Link>
          )}
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Check className="size-3" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Client component ─────────────────────────────────────────────────────────

interface Props {
  notifications: Notification[];
}

export function NotificationsClient({ notifications }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  function handleReadAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16">
        <Bell className="size-12 text-muted-foreground/40" />
        <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          No notifications yet
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          You'll be notified here when compliance issues are raised, CSR activities are approved, or badges are unlocked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleReadAll}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationRow key={n.id} notification={n} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
