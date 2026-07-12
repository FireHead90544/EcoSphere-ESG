"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChallengeForm } from "@/components/gamification/ChallengeForm";
import { createChallenge } from "@/lib/actions/gamification";
import { toast } from "sonner";
import type { Category } from "@/lib/generated/prisma/client";
import type { CreateChallengeInput } from "@/lib/schemas/gamification";

interface NewChallengeClientProps {
  categories: Pick<Category, "id" | "name">[];
}

export function NewChallengeClient({ categories }: NewChallengeClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: CreateChallengeInput) {
    setIsSubmitting(true);
    try {
      const result = await createChallenge(data);
      if (result.success) {
        toast.success("Challenge created", {
          description: `"${data.title}" was created as a Draft. Activate it when ready.`,
        });
        router.push("/gamification/challenges");
      } else {
        toast.error("Failed to create challenge", { description: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ChallengeForm
      categories={categories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Create Challenge (Draft)"
    />
  );
}
