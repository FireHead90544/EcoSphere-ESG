import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Server-side helper — ensures the user is authenticated.
 * Redirects to /login if not. Returns the session.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Server-side helper — ensures the user is an ADMIN.
 * Redirects to /dashboard if authenticated but not admin.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Get the current user's role from session (server-side).
 * Returns null if not authenticated.
 */
export async function getCurrentUserRole(): Promise<string | null> {
  const session = await auth();
  return session?.user?.role ?? null;
}

/**
 * Get the current user's employeeId from session (server-side).
 * Returns null if not authenticated or if user has no employee record.
 */
export async function getCurrentEmployeeId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.employeeId ?? null;
}

/**
 * Get the current user's id from session (server-side).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
