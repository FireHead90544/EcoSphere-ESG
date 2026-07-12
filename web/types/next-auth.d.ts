// next-auth.d.ts — Extends Auth.js v5 types with custom user fields
// This augments the built-in Session and JWT types so TypeScript knows
// about our custom role and employeeId fields throughout the app.

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      employeeId: string | null;
    };
  }

  interface User {
    role: string;
    employeeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    employeeId: string | null;
  }
}
