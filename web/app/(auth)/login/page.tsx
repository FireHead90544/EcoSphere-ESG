"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Leaf, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const parsed = LoginSchema.safeParse(formData);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: "Invalid email or password. Please try again." });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div
      className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ animationFillMode: "both" }}
    >
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Top gradient accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="p-8">
          {/* Logo + Brand */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25">
              <Leaf className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <h1
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                EcoSphere
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                ESG Management Platform
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                <AlertCircle className="size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@ecosphere.dev"
                  disabled={isPending}
                  className="w-full rounded-md border border-input bg-transparent py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/80 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  disabled={isPending}
                  className="w-full rounded-md border border-input bg-transparent py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/80 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="relative w-full rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-semibold text-foreground">Demo credentials</span>
              {" — "}
              <span className="font-mono">admin@ecosphere.dev</span>
              {" / "}
              <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
