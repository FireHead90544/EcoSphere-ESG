<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ecosphere-rules -->
# EcoSphere Project Rules

## Next.js 16 Conventions
- Route protection lives in `proxy.ts` (NOT `middleware.ts` — that name is deprecated in Next.js 16).
- `proxy.ts` runs in the **Edge Runtime** — never import Prisma, bcrypt, or any `node:*` module there.
- Use `getToken({ req, secret })` from `next-auth/jwt` for edge-safe JWT reading in proxy.ts.
- All Prisma access must be in Server Components, Server Actions, or Node.js Route Handlers only.

## Auth
- Import `auth` from `@/auth` for server-side session access in Server Components and Server Actions.
- Use `requireAuth()` / `requireAdmin()` from `@/lib/auth-utils` at the top of every admin Server Action.
- Session shape: `{ user: { id, email, role, employeeId } }` — types declared in `types/next-auth.d.ts`.

## Notifications (shared utility)
- Use `createNotification(params)` from `@/lib/actions/notifications` in your Server Actions.
- Never create `Notification` records directly via `prisma.notification.create` outside that file.

## Schema ownership
- Only Rudra merges changes to `prisma/schema.prisma`. Propose model changes as a PR diff/comment.
- After any schema change, run `npx prisma migrate dev --name <desc>` from `web/` and commit the migration.

## Validation pattern
- Every Server Action validates input with Zod and returns `ActionResult<T>` from `@/lib/schemas/shared`.
- Re-validate on the server even if the form validated client-side — never trust client input.

## File upload paths
- Proof files go to `uploads/<module>/<filename>` (dedicated directory, outside `public/`).
- Serve them via a Route Handler at `/api/uploads/[...path]` that checks auth before streaming.
<!-- END:ecosphere-rules -->

