"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPolicy } from "@/lib/actions/governance";
import { PolicySchema, type PolicyInput } from "@/lib/schemas/governance";
import { ArrowLeft, Loader2, FileCheck } from "lucide-react";
import Link from "next/link";

export function NewPolicyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PolicyInput>({ resolver: zodResolver(PolicySchema) });

  function onSubmit(data: PolicyInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await createPolicy(data);
      if (result.success) {
        router.push(`/governance/policies/${result.data.id}`);
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back link */}
      <Link
        href="/governance/policies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to policies
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          New ESG Policy
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a policy — employees will be prompted to read and acknowledge it.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="policy-title">
              Policy Title <span className="text-destructive">*</span>
            </label>
            <input
              id="policy-title"
              {...register("title")}
              placeholder="e.g. Environmental Compliance Policy 2025"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="policy-body">
              Policy Content <span className="text-destructive">*</span>
            </label>
            <textarea
              id="policy-body"
              {...register("body")}
              rows={12}
              placeholder="Write the full policy text here. Markdown formatting is preserved..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 transition-all resize-y font-mono"
            />
            {errors.body && (
              <p className="text-xs text-destructive">{errors.body.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
              <p className="text-sm text-destructive">{serverError}</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck className="size-4" />}
            {isPending ? "Creating…" : "Create Policy"}
          </button>
          <Link
            href="/governance/policies"
            className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
