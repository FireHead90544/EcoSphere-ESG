import { requireAuth } from "@/lib/auth-utils";
import { getMyNotifications } from "@/lib/actions/notifications";
import { NotificationsClient } from "@/app/(dashboard)/notifications/NotificationsClient";
import { Bell } from "lucide-react";

export const metadata = { title: "Notifications — EcoSphere" };

export default async function NotificationsPage() {
  await requireAuth();
  const notifications = await getMyNotifications();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notifications.filter((n) => !n.read).length} unread
          </p>
        </div>
      </div>

      <NotificationsClient notifications={notifications} />
    </div>
  );
}
