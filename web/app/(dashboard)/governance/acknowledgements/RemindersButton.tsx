"use client";

import { useTransition, useState } from "react";
import { sendAcknowledgementReminders } from "@/lib/actions/governance";
import { Bell, Loader2, Check } from "lucide-react";

export function RemindersButton({ policyId, pending }: { policyId: string; pending: number }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleSend() {
    startTransition(async () => {
      const result = await sendAcknowledgementReminders(policyId);
      if (result.success) setSent(true);
    });
  }

  if (sent) {
    return (
      <span className="shrink-0 flex items-center gap-1 text-xs text-[--esg-env] font-medium">
        <Check className="size-3.5" /> Reminders sent
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={isPending}
      className="shrink-0 flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="size-3 animate-spin" /> : <Bell className="size-3" />}
      {isPending ? "Sending…" : `Remind ${pending}`}
    </button>
  );
}
