"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAuditStatus } from "@/lib/actions/governance";
import { Loader2 } from "lucide-react";

type Status = "SCHEDULED" | "UNDER_REVIEW" | "COMPLETED";

const TRANSITIONS: Record<Status, { label: string; next: Status }[]> = {
  SCHEDULED: [{ label: "Start Review", next: "UNDER_REVIEW" }],
  UNDER_REVIEW: [{ label: "Mark Completed", next: "COMPLETED" }, { label: "Reschedule", next: "SCHEDULED" }],
  COMPLETED: [{ label: "Reopen Review", next: "UNDER_REVIEW" }],
};

export function AuditStatusButtons({ auditId, currentStatus }: { auditId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const transitions = TRANSITIONS[currentStatus as Status] ?? [];

  return (
    <div className="flex gap-2 flex-wrap">
      {transitions.map((t) => (
        <button
          key={t.next}
          disabled={isPending}
          onClick={() => startTransition(async () => {
            await updateAuditStatus(auditId, t.next);
            router.refresh();
          })}
          className="flex items-center gap-1.5 rounded-lg border border-[--esg-gov]/40 bg-[--esg-gov]/10 px-3 py-1.5 text-xs font-medium text-[--esg-gov] hover:bg-[--esg-gov]/20 transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="size-3 animate-spin" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}
