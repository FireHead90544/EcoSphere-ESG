"use client";

import { useTransition } from "react";
import { joinChallenge } from "@/lib/actions/gamification";
import { toast } from "sonner";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import type { Difficulty, ChallengeStatus } from "@/lib/generated/prisma/client";

interface ChallengesClientActionsProps {
  challengeId: string;
  isAdmin: boolean;
  hasJoined: boolean;
  status: ChallengeStatus;
  // Props forwarded to ChallengeCard
  title: string;
  description: string;
  xp: number;
  difficulty: Difficulty;
  deadline: Date;
  evidenceRequired: boolean;
  participantCount: number;
  categoryName: string;
  myProgress?: number;
}

/**
 * Client wrapper around ChallengeCard that handles the join mutation.
 * Keeps the parent Challenges page as a pure Server Component.
 */
export function ChallengesClientActions({
  challengeId,
  isAdmin,
  hasJoined,
  status,
  ...cardProps
}: ChallengesClientActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleJoin(id: string) {
    startTransition(async () => {
      const result = await joinChallenge({ challengeId: id });
      if (result.success) {
        toast.success("Challenge joined", {
          description: "Good luck! Submit your proof once you're done.",
        });
      } else {
        toast.error("Could not join", { description: result.error });
      }
    });
  }

  return (
    <ChallengeCard
      id={challengeId}
      status={status}
      isAdmin={isAdmin}
      myProgress={hasJoined ? cardProps.myProgress : undefined}
      onJoin={handleJoin}
      isJoining={isPending}
      {...cardProps}
    />
  );
}
