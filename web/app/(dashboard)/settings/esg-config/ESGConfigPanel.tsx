"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateESGConfig } from "@/lib/actions/settings";
import { ESGConfigSchema } from "@/lib/schemas/settings";
import { Loader2, Save, RotateCcw, Leaf, Users, Scale, Zap } from "lucide-react";
import type { ESGConfig } from "@/lib/generated/prisma/client";

interface Props { config: ESGConfig | null }

const DEFAULT = { envWeight: 0.4, socialWeight: 0.3, govWeight: 0.3, autoEmission: true, requireEvidence: false, autoBadgeAward: true, emailAlerts: true };

export function ESGConfigPanel({ config }: Props) {
  const initial = config ?? DEFAULT;
  const [env, setEnv] = useState(Math.round((initial.envWeight ?? 0.4) * 100));
  const [social, setSocial] = useState(Math.round((initial.socialWeight ?? 0.3) * 100));
  const [gov, setGov] = useState(Math.round((initial.govWeight ?? 0.3) * 100));
  const [autoEmission, setAutoEmission] = useState(initial.autoEmission ?? true);
  const [requireEvidence, setRequireEvidence] = useState(initial.requireEvidence ?? false);
  const [autoBadgeAward, setAutoBadgeAward] = useState(initial.autoBadgeAward ?? true);
  const [emailAlerts, setEmailAlerts] = useState(initial.emailAlerts ?? true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const total = env + social + gov;
  const isValid = total === 100;

  function handleSlider(which: "env" | "social" | "gov", val: number) {
    setSaved(false);
    if (which === "env") setEnv(val);
    else if (which === "social") setSocial(val);
    else setGov(val);
  }

  function handleReset() {
    setEnv(40); setSocial(30); setGov(30);
    setAutoEmission(true); setRequireEvidence(false); setAutoBadgeAward(true); setEmailAlerts(true);
    setSaved(false); setError(null);
  }

  function handleSave() {
    setError(null);
    const parsed = ESGConfigSchema.safeParse({
      envWeight: env / 100, socialWeight: social / 100, govWeight: gov / 100,
      autoEmission, requireEvidence, autoBadgeAward, emailAlerts,
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Validation error"); return; }

    startTransition(async () => {
      const result = await updateESGConfig(parsed.data);
      if (result.success) { setSaved(true); router.refresh(); }
      else setError(result.error);
    });
  }

  const pillars = [
    { key: "env" as const, label: "Environmental", icon: Leaf, value: env, set: (v: number) => handleSlider("env", v), color: "text-[--esg-env]", track: "bg-[--esg-env]" },
    { key: "social" as const, label: "Social", icon: Users, value: social, set: (v: number) => handleSlider("social", v), color: "text-[--esg-social]", track: "bg-[--esg-social]" },
    { key: "gov" as const, label: "Governance", icon: Scale, value: gov, set: (v: number) => handleSlider("gov", v), color: "text-[--esg-gov]", track: "bg-[--esg-gov]" },
  ];

  const toggles = [
    { key: "autoEmission", label: "Auto emission calculation", desc: "Automatically compute CO₂ from quantity × emission factor", value: autoEmission, set: setAutoEmission },
    { key: "requireEvidence", label: "Require evidence for CSR/challenges", desc: "Employees must upload proof before approval", value: requireEvidence, set: setRequireEvidence },
    { key: "autoBadgeAward", label: "Auto-award badges on completion", desc: "Automatically grant badges when challenge criteria are met", value: autoBadgeAward, set: setAutoBadgeAward },
    { key: "emailAlerts", label: "Email alerts for compliance issues", desc: "Send email notifications when new issues are raised", value: emailAlerts, set: setEmailAlerts },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>ESG Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Adjust scoring weights and feature toggles for the platform.</p>
      </div>

      {/* Weight sliders */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Score Weights</h2>
          <span className={`text-sm font-mono font-bold ${isValid ? "text-[--esg-env]" : "text-destructive"}`}>
            {total}% {isValid ? "✓" : `(need 100%)`}
          </span>
        </div>

        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`size-4 ${p.color}`} />
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                </div>
                <span className={`text-sm font-mono font-bold ${p.color}`}>{p.value}%</span>
              </div>
              <input
                type="range"
                min={10} max={80} step={5}
                value={p.value}
                onChange={(e) => p.set(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted/40 accent-primary"
              />
              <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${p.track}`} style={{ width: `${(p.value / 80) * 100}%`, opacity: 0.6 }} />
              </div>
            </div>
          );
        })}

        {!isValid && (
          <p className="text-xs text-destructive bg-destructive/8 rounded-lg p-3">
            Weights must sum to 100%. Currently: {total}%. Adjust sliders to balance.
          </p>
        )}
      </div>

      {/* Feature toggles */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-1">
        <h2 className="text-sm font-semibold text-foreground mb-4">Feature Toggles</h2>
        {toggles.map((t) => (
          <div key={t.key} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => { t.set(!t.value); setSaved(false); }}
              className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 ${t.value ? "bg-primary" : "bg-muted"}`}
              aria-checked={t.value}
              role="switch"
            >
              <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${t.value ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending || !isValid}
          className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_oklch(0.72_0.19_162/30%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isPending ? "Saving…" : saved ? "Saved ✓" : "Save Configuration"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <RotateCcw className="size-4" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
}
