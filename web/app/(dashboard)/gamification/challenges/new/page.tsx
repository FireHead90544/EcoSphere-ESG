import { requireAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewChallengeClient } from "@/components/gamification/NewChallengeClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New Challenge — EcoSphere",
};

export default async function NewChallengePage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    where: { type: "CHALLENGE", status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    redirect("/settings/categories");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/gamification/challenges"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to challenges
        </Link>
        <h1
          className="text-3xl font-bold text-foreground mt-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          New Challenge
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Challenges start as <span className="text-foreground font-medium">Draft</span> — activate them when ready.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <NewChallengeClient categories={categories} />
      </div>
    </div>
  );
}
