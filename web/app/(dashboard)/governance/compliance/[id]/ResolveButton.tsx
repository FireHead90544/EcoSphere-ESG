"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveComplianceIssue } from "@/lib/actions/governance";
import { CheckCircle, Loader2 } from "lucide-react";

export function ResolveButton({ issueId }: { issueId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await resolveComplianceIssue(issueId);
        router.refresh();
      })}
      className="flex items-center gap-2 rounded-xl bg-[--esg-env]/15 border border-[--esg-env]/30 px-4 py-2 text-sm font-medium text-[--esg-env] hover:bg-[--esg-env]/25 transition-all disabled:opacity-50"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
      {isPending ? "Resolving…" : "Mark Resolved"}
    </button>
  );
}
