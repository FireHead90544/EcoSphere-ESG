"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth-utils";
import type { NotifType } from "@/lib/generated/prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateNotificationParams {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  link?: string;
}

// ─── Create notification ──────────────────────────────────────────────────────

/**
 * Creates an in-app notification for a specific user.
 * Called from other Server Actions (governance, social, gamification).
 * 
 * @example
 * await createNotification({
 *   userId: ownerId,
 *   type: "COMPLIANCE_ISSUE",
 *   title: "New compliance issue assigned",
 *   body: "A HIGH severity issue has been assigned to you.",
 *   link: `/governance/compliance/${issueId}`,
 * });
 */
export async function createNotification(params: CreateNotificationParams) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    },
  });
}

/**
 * Bulk-create notifications for multiple users (e.g. policy reminders).
 */
export async function createNotifications(params: CreateNotificationParams[]) {
  if (params.length === 0) return;
  await prisma.notification.createMany({
    data: params.map((p) => ({
      userId: p.userId,
      type: p.type,
      title: p.title,
      body: p.body,
      link: p.link ?? null,
    })),
  });
}

// ─── Read notifications ───────────────────────────────────────────────────────

/**
 * Get all notifications for the current user, newest first.
 * Used by the /notifications page.
 */
export async function getMyNotifications() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Get unread count for the current user.
 * Also exposed as GET /api/notifications/unread-count for SWR polling.
 */
export async function getUnreadCount(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  return prisma.notification.count({
    where: { userId, read: false },
  });
}

// ─── Mark as read ─────────────────────────────────────────────────────────────

/** Mark a single notification as read. */
export async function markNotificationRead(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  // Only allow marking your own notifications
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });

  revalidatePath("/notifications");
}

/** Mark all notifications as read for the current user. */
export async function markAllNotificationsRead() {
  const userId = await getCurrentUserId();
  if (!userId) return;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  revalidatePath("/notifications");
}
