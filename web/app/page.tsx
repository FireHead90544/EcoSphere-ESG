import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Flame,
  Globe,
  Leaf,
  Scale,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react"

// ── Static data ────────────────────────────────────────────────────────────

const kpis = [
  {
    id: "carbon",
    label: "Carbon Intensity",
    value: "24.7",
    unit: "tCO₂e / $M rev",
    delta: "↓ 12% vs Q3",
    positive: true, // lower is better for carbon
    deltaPositive: true,
    icon: Leaf,
    accentVar: "--chart-1",
  },
  {
    id: "social",
    label: "Social Score",
    value: "78.4",
    unit: "out of 100",
    delta: "↑ +5.2 pts",
    positive: true,
    deltaPositive: true,
    icon: Users,
    accentVar: "--chart-2",
  },
  {
    id: "governance",
    label: "Governance Rating",
    value: "91.2",
    unit: "percentile rank",
    delta: "↑ +2.8 pts",
    positive: true,
    deltaPositive: true,
    icon: Scale,
    accentVar: "--chart-3",
  },
  {
    id: "esg-total",
    label: "ESG Total Score",
    value: "84.1",
    unit: "composite index",
    delta: "↑ +3.2 pts",
    positive: true,
    deltaPositive: true,
    icon: BarChart3,
    accentVar: "--primary",
  },
]

const pillars = [
  {
    id: "env",
    name: "Environmental",
    letter: "E",
    score: 81,
    icon: Leaf,
    chartVar: "--chart-1",
    metrics: [
      "CO₂ Emissions: −18% YoY",
      "Renewable Energy: 67%",
      "Water Intensity: −9%",
    ],
    tag: "On Track",
  },
  {
    id: "social",
    name: "Social",
    letter: "S",
    score: 78,
    icon: Users,
    chartVar: "--chart-2",
    metrics: [
      "Employee Satisfaction: 4.2 / 5",
      "Diversity Index: 0.74",
      "Community Investment: $2.1M",
    ],
    tag: "Improving",
  },
  {
    id: "gov",
    name: "Governance",
    letter: "G",
    score: 91,
    icon: Scale,
    chartVar: "--chart-3",
    metrics: [
      "Board Independence: 85%",
      "Audit Score: A+",
      "Policy Violations: 0",
    ],
    tag: "Excellent",
  },
]

const tiers = [
  { label: "Trailblazer", range: "90–100", colorVar: "--score-gold",     icon: Trophy,    active: false },
  { label: "Leader",       range: "75–89", colorVar: "--score-gold",     icon: Star,      active: true  },
  { label: "Achiever",     range: "60–74", colorVar: "--score-silver",   icon: CheckCircle, active: false },
  { label: "Developing",   range: "45–59", colorVar: "--score-bronze",   icon: TrendingUp,  active: false },
  { label: "At Risk",      range: "0–44",  colorVar: "--score-critical", icon: Zap,         active: false },
]

const palette = [
  { name: "Environmental", label: "E", var: "--chart-1", hex: "oklch(0.77 0.18 162)" },
  { name: "Social",        label: "S", var: "--chart-2", hex: "oklch(0.68 0.14 198)" },
  { name: "Governance",    label: "G", var: "--chart-3", hex: "oklch(0.75 0.17 75)"  },
  { name: "Risk / Warn",   label: "!",  var: "--chart-4", hex: "oklch(0.70 0.15 45)"  },
  { name: "Additional",    label: "+",  var: "--chart-5", hex: "oklch(0.68 0.18 300)" },
]

const standards = ["GRI Standards", "SASB Aligned", "TCFD Ready", "Odoo 17+"]

// ── Score Ring (pure SVG, no client JS needed) ─────────────────────────────

function ScoreRing({
  score,
  colorVar,
  size = 128,
  strokeWidth = 10,
}: {
  score: number
  colorVar: string
  size?: number
  strokeWidth?: number
}) {
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const c = size / 2

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={strokeWidth} />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={`var(${colorVar})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── Pillar mini-ring ───────────────────────────────────────────────────────

function MiniRing({ score, colorVar }: { score: number; colorVar: string }) {
  const size = 72
  const sw = 7
  const r = (size - sw * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const c = size / 2

  return (
    <div className="relative shrink-0" aria-label={`Score: ${score} out of 100`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth={sw} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-sm font-medium">{score}</span>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">

      {/* ── Ambient background glow ─────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 70% 0%, oklch(0.72 0.19 162 / 7%) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 20% 95%, oklch(0.68 0.14 198 / 5%) 0%, transparent 48%)",
        }}
      />

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{
                background: "var(--primary)",
                boxShadow: "0 0 16px oklch(0.72 0.19 162 / 35%)",
              }}
            >
              <Globe className="size-4" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight">EcoSphere</span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                background: "color-mix(in oklch, var(--primary) 12%, transparent)",
                color: "var(--primary)",
              }}
            >
              ESG
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            {["Dashboard", "Reports", "Analytics", "Compliance"].map((item) => (
              <a key={item} href="#" className="transition-colors duration-150 hover:text-foreground">
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground lg:block">
              Press{" "}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                D
              </kbd>{" "}
              to toggle theme
            </span>
            <Button
              id="nav-get-started"
              size="sm"
              style={{ boxShadow: "0 0 14px oklch(0.72 0.19 162 / 25%)" }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-20 text-center">

        {/* Pill badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
          <Flame className="size-3" style={{ color: "var(--score-gold)" }} />
          <span>Odoo Hack 2026 · Problem Statement: EcoSphere</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight lg:text-6xl">
          ESG Management
          <span className="mt-1 block">
            for the{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.77 0.18 162) 0%, oklch(0.68 0.14 198) 100%)",
              }}
            >
              Next Decade.
            </span>
          </span>
        </h1>

        {/* Subline */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Track Environmental, Social, and Governance impact in real time.
          Gamified scoring. Odoo‑native workflows. Built for organisations
          that take sustainability seriously.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            id="hero-start-tracking"
            size="lg"
            className="gap-2"
            style={{ boxShadow: "0 0 22px oklch(0.72 0.19 162 / 32%)" }}
          >
            Start Tracking <ArrowRight className="size-4" />
          </Button>
          <Button id="hero-view-dashboard" size="lg" variant="outline">
            View Dashboard
          </Button>
        </div>

        {/* Trust strip */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {standards.map((badge) => (
            <span key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="size-3 text-primary" />
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* ── KPI strip ───────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
              >
                {/* Gradient top accent */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, var(${kpi.accentVar}), transparent)`,
                  }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className="mb-3 inline-flex size-8 items-center justify-center rounded-lg"
                  style={{
                    background: `color-mix(in oklch, var(${kpi.accentVar}) 15%, transparent)`,
                  }}
                >
                  <Icon className="size-4" style={{ color: `var(${kpi.accentVar})` }} />
                </div>

                {/* Value */}
                <div className="font-mono text-3xl font-medium">{kpi.value}</div>
                <div className="mt-0.5 text-xs font-semibold text-muted-foreground">
                  {kpi.label}
                </div>

                {/* Delta */}
                <div
                  className="mt-3 text-xs font-medium"
                  style={{ color: kpi.deltaPositive ? "var(--chart-1)" : "var(--destructive)" }}
                >
                  {kpi.delta}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{kpi.unit}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── ESG Pillars ─────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">ESG Pillars</h2>
            <p className="mt-1 text-sm text-muted-foreground">Q4 2025 · performance breakdown</p>
          </div>
          <Button id="pillars-view-all" variant="outline" size="sm">
            View all metrics
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.id}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-6"
              >
                {/* Top accent */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, var(${pillar.chartVar}) 40%, transparent)`,
                  }}
                  aria-hidden="true"
                />

                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{
                        background: `color-mix(in oklch, var(${pillar.chartVar}) 18%, transparent)`,
                      }}
                    >
                      <Icon className="size-5" style={{ color: `var(${pillar.chartVar})` }} />
                    </div>
                    <div>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: `var(${pillar.chartVar})` }}
                      >
                        {pillar.letter}
                      </div>
                      <div className="font-heading text-base font-semibold">{pillar.name}</div>
                    </div>
                  </div>

                  <MiniRing score={pillar.score} colorVar={pillar.chartVar} />
                </div>

                {/* Metrics list */}
                <ul className="mt-5 space-y-2.5" aria-label={`${pillar.name} metrics`}>
                  {pillar.metrics.map((metric) => (
                    <li key={metric} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle
                        className="mt-0.5 size-3.5 shrink-0"
                        style={{ color: `var(${pillar.chartVar})` }}
                      />
                      {metric}
                    </li>
                  ))}
                </ul>

                {/* Status badge */}
                <div className="mt-5">
                  <span
                    className="rounded px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: `color-mix(in oklch, var(${pillar.chartVar}) 12%, transparent)`,
                      color: `var(${pillar.chartVar})`,
                      border: `1px solid color-mix(in oklch, var(${pillar.chartVar}) 28%, transparent)`,
                    }}
                  >
                    {pillar.tag}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Score + Gamification ────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Overall Score card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8">
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--primary), transparent)" }}
              aria-hidden="true"
            />
            <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Overall ESG Score
            </h3>

            <div className="mt-6 flex items-center gap-8">
              {/* Ring + value */}
              <div
                className="relative shrink-0"
                role="meter"
                aria-valuenow={84}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="ESG Score: 84.1 out of 100"
              >
                <ScoreRing score={84} colorVar="--primary" size={128} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-medium">84.1</span>
                  <span className="text-[10px] text-muted-foreground">/ 100</span>
                </div>
              </div>

              {/* Score details */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <div
                    className="font-heading text-2xl font-bold"
                    style={{ color: "var(--score-gold)" }}
                  >
                    Leader
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Tier 2 of 5</div>
                </div>
                <div className="text-sm text-foreground">
                  +3.2 pts this quarter
                </div>
                <div className="text-xs text-muted-foreground">Top 15% in your sector</div>
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--score-gold)" }}
                >
                  <Flame className="size-3" aria-hidden="true" />
                  12-week improvement streak
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Tiers card */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--chart-3), transparent)" }}
              aria-hidden="true"
            />
            <h3 className="font-heading mb-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Achievement Tiers
            </h3>

            <div className="space-y-2" role="list" aria-label="Gamification tiers">
              {tiers.map((tier) => {
                const Icon = tier.icon
                return (
                  <div
                    key={tier.label}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                    role="listitem"
                    style={
                      tier.active
                        ? {
                            background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                            border: "1px solid color-mix(in oklch, var(--primary) 28%, transparent)",
                          }
                        : {
                            background: "oklch(1 0 0 / 3%)",
                            border: "1px solid transparent",
                          }
                    }
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: `var(${tier.colorVar})` }}
                      aria-hidden="true"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={tier.active ? undefined : { color: "var(--muted-foreground)" }}
                      >
                        {tier.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{tier.range}</span>
                    </div>
                    {tier.active && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                        style={{
                          background: "color-mix(in oklch, var(--primary) 15%, transparent)",
                          color: "var(--primary)",
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Chart Palette (design system validation) ────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--chart-5), transparent)" }}
            aria-hidden="true"
          />
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Design System · Chart Palette
          </div>
          <p className="mb-6 text-xs text-muted-foreground">
            ESG pillar color encoding — consistent across all charts and data visualizations
          </p>

          <div className="flex flex-wrap gap-6">
            {palette.map((color) => (
              <div key={color.name} className="flex items-center gap-3">
                <div
                  className="relative size-10 rounded-lg"
                  style={{ background: `var(${color.var})` }}
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black/50">
                    {color.label}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{color.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 text-primary" aria-hidden="true" />
            <span>EcoSphere · Odoo Hack 2026</span>
          </div>
          <span>
            Press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              D
            </kbd>{" "}
            to switch light / dark
          </span>
        </div>
      </footer>
    </div>
  )
}
