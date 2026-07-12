// proxy.ts — Next.js 16 Proxy (replaces middleware.ts)
// Runs in the Edge Runtime — must NOT import Prisma or any Node.js-only modules.
// We decode the Auth.js JWT ourselves using the Web Crypto API to stay edge-safe.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static / _next/image (static assets)
     * - favicon.ico
     * - public folder
     * - api/auth (Auth.js endpoints — must be unrestricted)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  // Read JWT token from the session cookie (edge-safe — no DB)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
  });

  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  // Allow login page — redirect to dashboard if already logged in
  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes — redirect non-admins to dashboard
  const adminOnlyPrefixes = ["/settings"];
  const isAdminRoute = adminOnlyPrefixes.some((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
}
