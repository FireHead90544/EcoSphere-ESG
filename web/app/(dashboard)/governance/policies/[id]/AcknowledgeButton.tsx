"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acknowledgePolicy } from "@/lib/actions/governance";
import { CheckCircle, Loader2 } from "lucide-react";

export function AcknowledgeButton({ policyId }: { policyId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAcknowledge() {
    startTransition(async () => {
      await acknowledgePolicy(policyId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleAcknowledge}
      disabled={isPending}
      className="flex items-center gap-2 rounded-2xl bg-[--esg-gov] px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
      {isPending ? "Acknowledging…" : "I Acknowledge this Policy"}
    </button>
  );
}
