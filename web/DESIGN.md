# EcoSphere Design System
**Single source of truth for all UI/UX work on EcoSphere — ESG Management Platform**
*Odoo Hack 2026 · Version 1.0*

---

## 1. Design Philosophy

EcoSphere makes ESG (Environmental, Social, Governance) data feel **alive, urgent, and actionable** — not a compliance checkbox. The visual language is **Deep Bioluminescence**: a deep space-indigo canvas lit by bioluminescent signals. Data metrics pulse with life. Gamified scoring turns abstract impact into tangible progress.

**Three pillars:**
- **Living Data** — numbers breathe, charts pulse, scores update with weight
- **Planetary Stakes** — every color and metaphor connects to earth, ocean, atmosphere
- **Earned Clarity** — information hierarchy is earned through contrast, not decoration

**Default theme: Dark.** Light theme is available and must look equally refined.

---

## 2. Color System

All colors are defined as CSS custom properties in `app/globals.css` using the **oklch** color space for perceptual uniformity. Never hardcode hex/rgb values in components — always reference these tokens.

### 2.1 Semantic Tokens

| Token | Dark value | Light value | Role |
|---|---|---|---|
| `--background` | Space indigo `oklch(0.11 0.025 256)` | Cool white `oklch(0.97 0.004 220)` | Page canvas |
| `--foreground` | Ice white `oklch(0.96 0.005 220)` | Deep navy `oklch(0.12 0.025 256)` | Primary text |
| `--card` | Abyss `oklch(0.16 0.022 256)` | Pure white `oklch(1 0 0)` | Card surface |
| `--card-foreground` | Ice white | Deep navy | Text on cards |
| `--popover` | Abyss `oklch(0.16 0.022 256)` | Pure white | Dropdowns, tooltips |
| `--popover-foreground` | Ice white | Deep navy | Text in popovers |
| `--primary` | Bioluminescent emerald `oklch(0.72 0.19 162)` | Emerald `oklch(0.52 0.18 162)` | Primary actions, CTAs |
| `--primary-foreground` | Deep emerald `oklch(0.10 0.03 162)` | Near-white `oklch(0.97 0.010 166)` | Text on primary |
| `--secondary` | Elevated surface `oklch(0.20 0.025 256)` | Soft mist `oklch(0.93 0.006 220)` | Secondary UI surfaces |
| `--secondary-foreground` | Ice white `oklch(0.95 0.005 220)` | Deep navy `oklch(0.18 0.025 256)` | Text on secondary |
| `--muted` | Muted surface `oklch(0.20 0.020 256)` | Light mist `oklch(0.94 0.004 220)` | Disabled, background fills |
| `--muted-foreground` | Dim `oklch(0.62 0.015 220)` | Slate `oklch(0.48 0.018 220)` | Placeholder, captions |
| `--accent` | Glow surface `oklch(0.22 0.030 256)` | Accent bg `oklch(0.92 0.006 220)` | Hover/focus fills |
| `--accent-foreground` | Ice white `oklch(0.95 0.005 220)` | Deep navy `oklch(0.18 0.025 256)` | Text on accent |
| `--destructive` | Alert red `oklch(0.68 0.20 22)` | Red `oklch(0.58 0.22 27)` | Errors, warnings |
| `--border` | White 8% `oklch(1 0 0 / 8%)` | Cool gray `oklch(0.87 0.007 220)` | Dividers, card borders |
| `--input` | White 12% `oklch(1 0 0 / 12%)` | Input border `oklch(0.87 0.007 220)` | Form field borders |
| `--ring` | Emerald `oklch(0.72 0.19 162)` | Emerald `oklch(0.52 0.18 162)` | Focus rings |

### 2.2 Sidebar Tokens

| Token | Dark | Light |
|---|---|---|
| `--sidebar` | `oklch(0.14 0.022 256)` | `oklch(0.95 0.004 220)` |
| `--sidebar-foreground` | `oklch(0.96 0.005 220)` | `oklch(0.12 0.025 256)` |
| `--sidebar-primary` | `oklch(0.72 0.19 162)` | `oklch(0.52 0.18 162)` |
| `--sidebar-primary-foreground` | `oklch(0.10 0.03 162)` | `oklch(0.97 0.010 166)` |
| `--sidebar-accent` | `oklch(0.22 0.030 256)` | `oklch(0.90 0.006 220)` |
| `--sidebar-accent-foreground` | `oklch(0.95 0.005 220)` | `oklch(0.18 0.025 256)` |
| `--sidebar-border` | `oklch(1 0 0 / 8%)` | `oklch(0.87 0.007 220)` |
| `--sidebar-ring` | `oklch(0.72 0.19 162)` | `oklch(0.52 0.18 162)` |

### 2.3 Chart / Data Palette

These 5 chart colors encode the ESG pillars and data states. Use consistently:

| Token | Value | Meaning |
|---|---|---|
| `--chart-1` | `oklch(0.77 0.18 162)` — Emerald | Environmental metrics, CO₂, biodiversity |
| `--chart-2` | `oklch(0.68 0.14 198)` — Teal | Social metrics, workforce, community |
| `--chart-3` | `oklch(0.75 0.17 75)` — Amber | Governance metrics, compliance, board |
| `--chart-4` | `oklch(0.70 0.15 45)` — Amber-orange | At-risk states, warnings, declining KPIs |
| `--chart-5` | `oklch(0.68 0.18 300)` — Violet | Additional dimensions, audit trails |

### 2.4 Extended Design Tokens (use via Tailwind classes or CSS vars)

These supplement the shadcn system for EcoSphere-specific patterns:

```css
/* Apply these in globals.css under :root / .dark as needed */

/* ESG Pillar accent colors (for badges, tags, icons) */
--esg-env:    oklch(0.72 0.19 162);   /* Environmental — emerald */
--esg-social: oklch(0.65 0.14 198);   /* Social — teal-blue */
--esg-gov:    oklch(0.72 0.17 75);    /* Governance — amber */

/* Gamification */
--score-gold:     oklch(0.82 0.18 85);   /* Gold achievement */
--score-silver:   oklch(0.75 0.04 220);  /* Silver tier */
--score-bronze:   oklch(0.68 0.12 55);   /* Bronze tier */
--score-critical: oklch(0.65 0.20 22);   /* Critical/failing score */

/* Glow effects (dark mode only) */
--glow-primary: 0 0 20px oklch(0.72 0.19 162 / 25%);
--glow-amber:   0 0 20px oklch(0.72 0.17 75 / 20%);
```

### 2.5 Color Use Rules

- **Never use raw color values** in components. Always use token names.
- **Primary (emerald)** is for: primary buttons, active nav items, progress bars, score indicators, positive deltas.
- **Amber** is for: governance badges, streak achievements, warnings that aren't errors, "at risk" states.
- **Destructive (red)** is for: actual errors, critical compliance failures, data that requires immediate action.
- **Muted** is for: empty states, disabled UI, secondary metadata, timestamps.
- In **light mode**, add a subtle box-shadow to cards instead of a border glow — glows belong to dark mode only.

---

## 3. Typography

Fonts are configured in `app/layout.tsx`. **Do not change the font stack.**

| Variable | Font | Weight range | Role |
|---|---|---|---|
| `--font-heading` | **Montserrat** | 600–800 | Page titles, section headers, score labels |
| `--font-sans` | **Oxanium** | 400–700 | Body text, UI labels, navigation, data values |
| `--font-mono` | **Geist Mono** | 400–500 | Metric values, code, percentages, IDs |

### 3.1 Type Scale

| Class | Size | Weight | Font | Use |
|---|---|---|---|---|
| Display | `text-5xl` / `text-6xl` | 800 | Montserrat | Hero headlines only |
| H1 | `text-3xl` / `text-4xl` | 700 | Montserrat | Page title (one per page) |
| H2 | `text-2xl` | 700 | Montserrat | Section titles |
| H3 | `text-xl` | 600 | Montserrat | Card titles, subsection headers |
| H4 | `text-base` | 600 | Oxanium | Group labels, sidebar items |
| Body | `text-sm` | 400 | Oxanium | Paragraph text, descriptions |
| Caption | `text-xs` | 400 | Oxanium | Metadata, timestamps, footnotes |
| Metric | `text-2xl`–`text-4xl` | 500 | Geist Mono | KPI values, percentages, scores |
| Label | `text-xs` | 600 | Oxanium | Badge text, tags, chip labels |

### 3.2 Typography Rules

- **Heading hierarchy is strict**: one `<h1>` per page. Use semantic elements (`<h2>`, `<h3>`) for structure, not visual styling.
- **Metric values** always use `font-mono`. Decimal places should be in a slightly smaller size or `text-muted-foreground`.
- **Uppercase sparingly**: acceptable for category labels, badge text, or section eyebrows — not for general body copy.
- **Letter spacing**: `tracking-widest` for uppercase labels and eyebrows only. Body text uses default tracking.
- **Line height**: body text uses `leading-relaxed` (1.625). Dense data tables use `leading-snug`.

---

## 4. Spacing & Layout

The project uses Tailwind v4's default spacing scale. Follow these layout conventions:

### 4.1 Page Layout

```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main content area    │
│  ─────────────────────  │  ─────────────────    │
│  Logo (64px top)        │  Topbar (56px)        │
│  Nav items              │  ───────────────────  │
│  ─────────────          │  Content (p-6 lg:p-8) │
│  Bottom: User/Settings  │                       │
└─────────────────────────────────────────────────┘
```

- **Sidebar width**: `w-60` (240px) on desktop, hidden on mobile with slide-in drawer
- **Content padding**: `p-6` default, `p-8` on `lg:` and above
- **Max content width**: `max-w-7xl mx-auto` inside the content area
- **Section gaps**: `gap-6` between card rows, `gap-4` within card groups

### 4.2 Card Grid

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  KPI Card    │ │  KPI Card    │ │  KPI Card    │ │  KPI Card    │
│  (1/4 width) │ │  (1/4 width) │ │  (1/4 width) │ │  (1/4 width) │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
┌───────────────────────────────┐ ┌───────────────────────────────┐
│  Chart Card (1/2 width)       │ │  Chart Card (1/2 width)       │
└───────────────────────────────┘ └───────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  Data Table (full width)                                        │
└─────────────────────────────────────────────────────────────────┘
```

Standard grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`

---

## 5. Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | `calc(var(--radius) * 0.6)` ≈ 4.5px | Tags, badges, small chips |
| `rounded-md` | `calc(var(--radius) * 0.8)` ≈ 6px | Input fields, selects |
| `rounded-lg` | `var(--radius)` = 0.75rem / 12px | Cards, panels, modals |
| `rounded-xl` | `calc(var(--radius) * 1.4)` ≈ 16.8px | Feature cards, hero blocks |
| `rounded-2xl` | `calc(var(--radius) * 1.8)` ≈ 21.6px | Large modals, drawers |
| `rounded-full` | 9999px | Avatars, score rings, icon buttons |

**Rule:** Buttons use `rounded-2xl` (inherited from shadcn base). Cards use `rounded-lg` or `rounded-xl`. Never mix arbitrary radii — use the scale.

---

## 6. Component Patterns

### 6.1 KPI / Metric Card

The primary atom of ESG dashboards. Shows a single metric with trend.

```tsx
// Structure:
<Card className="relative overflow-hidden">
  {/* Subtle top-border accent via a 1px gradient line */}
  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
  <CardHeader className="pb-2">
    <CardDescription>Carbon Intensity</CardDescription>  {/* metric name */}
    <CardTitle className="font-mono text-3xl">24.7</CardTitle>  {/* value */}
  </CardHeader>
  <CardContent>
    <span className="text-xs text-chart-1">↓ 12% vs last quarter</span>  {/* trend */}
    <p className="text-xs text-muted-foreground mt-0.5">tCO₂e / $M revenue</p>  {/* unit */}
  </CardContent>
</Card>
```

**Dark mode card appearance:** Add `shadow-[0_1px_0_0_oklch(1_0_0/6%)]` (subtle top highlight) and `border-border` for the card outline.

### 6.2 ESG Score Ring

A circular progress indicator for the overall ESG score. Use SVG or a CSS conic-gradient approach.

```tsx
// Score color logic:
// score >= 80 → text-chart-1 (emerald) — "Excellent"
// score >= 60 → text-chart-3 (amber) — "Good"
// score >= 40 → text-chart-4 (orange) — "Needs Work"
// score < 40  → text-destructive — "Critical"
```

Ring thickness: `stroke-width: 8`. Background ring: `stroke: oklch(1 0 0 / 10%)`.

### 6.3 Buttons

Inherit from shadcn. Additional guidelines:

| Variant | When to use |
|---|---|
| `default` | Primary action — "Save", "Submit Report", "Run Analysis" |
| `secondary` | Secondary action — "Export", "Filter", "Compare" |
| `outline` | Tertiary / destructive-adjacent — "Cancel", "Reset" |
| `ghost` | In-table actions, icon-only controls |
| `destructive` | Destructive confirmation only — "Delete Record", "Revoke Access" |
| `link` | In-prose navigation, breadcrumb-adjacent |

**Glow on primary (dark mode only):** Add `shadow-[0_0_16px_oklch(0.72_0.19_162/30%)]` on hover for primary buttons. This is the signature interaction.

### 6.4 Navigation / Sidebar

```
Sidebar item states:
- Default:  text-muted-foreground, no background
- Hover:    bg-accent, text-accent-foreground
- Active:   bg-primary/15, text-primary, left-border 2px solid primary
```

Active item left border: `border-l-2 border-primary pl-[calc(1rem-2px)]`

Group labels (section eyebrows): `text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1`

### 6.5 Badges / Pill Tags

ESG pillar badges use specific colors:

```tsx
// Environmental
<Badge className="bg-[--esg-env]/15 text-[--esg-env] border-[--esg-env]/25">
  Environmental
</Badge>

// Social
<Badge className="bg-[--esg-social]/15 text-[--esg-social] border-[--esg-social]/25">
  Social
</Badge>

// Governance
<Badge className="bg-[--esg-gov]/15 text-[--esg-gov] border-[--esg-gov]/25">
  Governance
</Badge>
```

All badges: `rounded-sm px-2 py-0.5 text-xs font-semibold border`

### 6.6 Data Tables

- Header: `bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide`
- Rows alternate: even rows `bg-muted/20`, odd rows transparent
- Hover row: `hover:bg-accent/50`
- Positive delta cell: `text-chart-1 font-mono`
- Negative delta cell: `text-destructive font-mono`
- Sorting icon: `lucide/ArrowUpDown` in muted, active sort uses primary color

### 6.7 Empty States

Empty states are invitations to act, not apologies:

```
┌──────────────────────────────────────┐
│         [Icon: lucide/Leaf, size=48] │
│         text-muted-foreground/40     │
│                                      │
│    No reports yet                    │  ← h3, font-heading
│    Upload your first ESG report      │  ← text-muted-foreground, text-sm
│    to start tracking metrics.        │
│                                      │
│         [Button: Upload Report]      │  ← primary variant
└──────────────────────────────────────┘
```

Never write "Nothing to show here" or "No data found." Always explain *what* can be done.

### 6.8 Toasts / Notifications

- **Success**: `border-l-4 border-chart-1` — "Report submitted. ESG score updated."
- **Warning**: `border-l-4 border-chart-3` — "Deadline approaching for Q3 disclosure."
- **Error**: `border-l-4 border-destructive` — "Upload failed. File exceeds 50 MB limit."
- **Info**: `border-l-4 border-chart-2` — "New benchmark data available for your sector."

---

## 7. Gamification Patterns

EcoSphere uses gamification to make ESG improvement feel rewarding and progress tangible.

### 7.1 Score Tiers

| Tier | Score | Color token | Label | Icon |
|---|---|---|---|---|
| Platinum | 90–100 | `--score-gold` | Trailblazer | 🌿 |
| Gold | 75–89 | `--score-gold` | Leader | ⭐ |
| Silver | 60–74 | `--score-silver` | Achiever | ✓ |
| Bronze | 45–59 | `--score-bronze` | Developing | △ |
| Critical | 0–44 | `--score-critical` | At Risk | ⚠ |

### 7.2 Progress & Streaks

- Progress bars: `bg-primary` fill on `bg-muted` track. Use `rounded-full` for both.
- Streak counters: Amber glow + `--score-gold` color. Show flame icon from lucide.
- Achievement badges: Circular, `rounded-full`, gradient border using `border-gradient` technique (box-shadow layering for compatibility).

### 7.3 Leaderboard Rows

```
┌─────────────────────────────────────────────────────────┐
│ #1  🏆  Acme Corp          98.2   ▲ +2.1   [Trailblazer]│
│ #2      Vertex Industries   91.4   ▲ +0.8   [Leader]    │
│ #3      [Your Company]      84.1   ▼ -1.2   [Leader]    │  ← highlighted row
└─────────────────────────────────────────────────────────┘
```

"Your row" highlight: `bg-primary/10 border border-primary/30`

---

## 8. Motion & Animation

Use motion purposefully. Ambient animation should feel like a living ecosystem, not a loading spinner graveyard.

### 8.1 Transition Defaults

```css
/* Use these durations */
--duration-fast: 150ms;    /* hover states, toggles */
--duration-base: 250ms;    /* cards expanding, panels opening */
--duration-slow: 400ms;    /* page transitions, score reveals */
--easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* score counters, badge pop-in */
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);        /* most UI transitions */
```

### 8.2 Specific Animation Patterns

**Score counter animation**: Numbers count up from 0 on mount. Use `useCountUp` hook or CSS animation. Duration: 1.2s with `--easing-spring`.

**Card entrance**: `animate-in fade-in slide-in-from-bottom-2 duration-300`. Stagger sibling cards by 50ms each.

**ESG score ring**: Stroke-dashoffset animation from 0 → target. Duration: 1s, delay: 300ms after mount.

**Primary button hover (dark mode)**: Add `transition-shadow duration-200` with the emerald glow shadow.

**Chart data load**: Bars/lines animate from baseline up. This is handled by the charting library (Recharts recommended) — use `animationDuration={800}`.

### 8.3 Reduced Motion

Always respect `prefers-reduced-motion`. All animations must be wrapped:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Or in Tailwind: use `motion-safe:animate-*` variants.

---

## 9. Icons

**Library**: Lucide React (already installed as `lucide-react`).

### 9.1 Icon Size Conventions

| Context | Size class | px |
|---|---|---|
| Inline with text | `size-4` | 16px |
| Card header icon | `size-5` | 20px |
| Section icon / nav | `size-5` | 20px |
| Feature/empty state | `size-12` | 48px |
| Hero decorative | `size-16`+ | 64px+ |

### 9.2 ESG Icon Mapping

| Concept | Icon |
|---|---|
| Environmental | `Leaf`, `TreePine`, `Wind`, `Droplets` |
| Social | `Users`, `Heart`, `HandHeart`, `Building2` |
| Governance | `Scale`, `Shield`, `FileCheck`, `Landmark` |
| Carbon / emissions | `Factory`, `CloudFog`, `Gauge` |
| Score / Achievement | `Trophy`, `Star`, `Medal`, `Flame` |
| Data / Reporting | `BarChart3`, `TrendingUp`, `TrendingDown`, `FileBarChart` |
| Compliance | `CheckCircle`, `AlertTriangle`, `XCircle` |

---

## 10. Data Visualization

**Recommended library**: Recharts (install as needed). Alternatively, use CSS/SVG for simple indicators.

### 10.1 Chart Color Order

Always apply chart colors in this pillar order when showing ESG breakdown:
1. `--chart-1` (emerald) — Environmental
2. `--chart-2` (teal) — Social
3. `--chart-3` (amber) — Governance
4. `--chart-4` (orange) — Other / Risk
5. `--chart-5` (violet) — Additional

### 10.2 Chart Styling

- **Grid lines**: `strokeOpacity: 0.08` on dark, `strokeOpacity: 0.15` on light
- **Axis labels**: Oxanium font, `text-xs`, `fill: var(--muted-foreground)`
- **Tooltips**: Use dark card style always (even in light mode) — `bg-card border-border shadow-xl`
- **Area fills**: Use chart color with `opacity: 0.15` for area charts
- **Reference lines**: `stroke: var(--border)`, `strokeDasharray: 4 4`

---

## 11. Forms & Input Patterns

### 11.1 Field Anatomy

```
[Label]           ← text-sm font-medium, text-foreground
[Input field]     ← rounded-md, border-input, bg-background (transparent in dark)
[Helper text]     ← text-xs text-muted-foreground, mt-1
[Error message]   ← text-xs text-destructive, mt-1 (replaces helper when invalid)
```

### 11.2 File Upload (for ESG Reports)

Use a drag-drop zone, not a bare `<input type="file">`:

```
┌────────────────────────────────────────────┐  ← rounded-xl border-2 border-dashed border-border
│   [Upload icon: FileUp, size-10]           │  ← text-muted-foreground/50
│                                            │
│   Drag & drop your ESG report              │  ← text-sm font-medium
│   PDF, XLSX, or CSV · Max 50 MB            │  ← text-xs text-muted-foreground
│                                            │
│   [Browse files]                           │  ← outline button
└────────────────────────────────────────────┘
```

Hover state: `border-primary/50 bg-primary/5`

---

## 12. Copy & Voice

EcoSphere speaks with **measured confidence**: it doesn't sell, it informs. It's precise, direct, and treats users as intelligent professionals managing real planetary impact.

| Pattern | Right | Wrong |
|---|---|---|
| Button labels | "Submit Report" | "Click Here to Submit" |
| Success state | "Report submitted. Score updated to 84.2." | "Yay! Great job!" |
| Error state | "Upload failed. File must be under 50 MB." | "Something went wrong, please try again." |
| Empty state | "No suppliers added. Add one to track their ESG performance." | "Nothing here yet!" |
| Progress | "73 / 100 requirements met" | "Almost there!" |
| Score change | "Score improved by 3.2 points this quarter." | "Amazing improvement!" |
| Confirmation | "Delete this report?" | "Are you sure? This can't be undone!" |

**Tone rules:**
- Sentence case everywhere (not Title Case in body copy)
- No exclamation points in system messages
- Numbers always in `font-mono`
- Units always specified (`tCO₂e`, `%`, `$M`) — never ambiguous
- Abbreviations spelled out on first use: Environmental, Social, Governance (ESG)

---

## 13. Accessibility

- **Focus rings**: All interactive elements inherit `outline-none focus-visible:ring-2 focus-visible:ring-ring/80` from the global base styles. Never remove focus-visible styles.
- **Color contrast**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text). The emerald primary on the dark background is verified — do not lower its lightness below `oklch(0.65 ...)` on dark surfaces.
- **Keyboard navigation**: Sidebar nav, data tables, and modals must be fully keyboard navigable. Use shadcn's built-in accessible components.
- **ARIA labels**: Icon-only buttons **must** have `aria-label`. Score rings must have `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- **Reduced motion**: See section 8.3.

---

## 14. Theming & Token Override Guide

The design system ships dark-first. The theme provider sets `defaultTheme="dark"` with light mode toggleable.

**To apply the correct class**, shadcn uses `class="dark"` on `<html>`. This is already wired via `next-themes`.

**Adding new semantic tokens:**
1. Add to both `:root` (light) and `.dark` in `app/globals.css`
2. Expose in `@theme inline {}` block if needed as Tailwind colors
3. Document here in DESIGN.md with rationale

**Extending chart colors beyond 5:** Name them `--chart-6`, `--chart-7`, etc. Prefer hues not yet used (range: 250–290 for blue-violet space).

---

## 15. File & Component Organization

```
web/
├── app/
│   ├── globals.css          ← Token definitions (source of truth for CSS vars)
│   ├── layout.tsx           ← Font loading, ThemeProvider
│   └── (routes)/
├── components/
│   ├── ui/                  ← shadcn primitives (do not modify directly)
│   ├── dashboard/           ← Dashboard-specific composed components
│   ├── esg/                 ← ESG domain components (ScoreRing, PillarCard, etc.)
│   ├── gamification/        ← Achievement, LeaderBoard, StreakCounter
│   └── theme-provider.tsx
├── lib/
│   └── utils.ts             ← cn() and other utilities
└── DESIGN.md                ← (this file)
```

**Naming conventions:**
- Components: PascalCase, named after their role — `EsgScoreRing`, `KpiMetricCard`, `PillarBreakdownChart`
- CSS classes: Use Tailwind utilities. Custom classes only for unavoidable complex selectors.
- Files: kebab-case for non-component files, PascalCase for component files

---

## 16. Quick Reference Cheatsheet

```
COLORS          dark bg           oklch(0.11 0.025 256)
                card bg           oklch(0.16 0.022 256)
                primary           oklch(0.72 0.19 162)   [emerald]
                amber accent      oklch(0.72 0.17 75)
                muted text        oklch(0.62 0.015 220)

FONTS           heading           Montserrat, 600–800
                body/ui           Oxanium, 400–700
                metrics/code      Geist Mono, 400–500

RADIUS          base              0.75rem (cards: rounded-lg)
                buttons           rounded-2xl

SPACING         content pad       p-6 / lg:p-8
                card gap          gap-4 / gap-6

MOTION          fast hover        150ms smooth
                card entrance     300ms fade+slide, 50ms stagger
                score counter     1.2s spring

CHART ORDER     [1] emerald=env  [2] teal=social  [3] amber=gov
                [4] orange=risk  [5] violet=extra
```

---

*This document is maintained alongside `app/globals.css`. When CSS variables change, update the tables here. When new component patterns are established, document them in section 6.*
