# Portfolio Modernization — Design Foundation

Date: 2026-08-07
Status: Approved

## Goals & Scope

The Astro migration (see `2026-08-06-portfolio-overhaul-design.md`) rebuilt the site's
architecture but deliberately preserved the old visual language as a working baseline —
that spec explicitly called out "final visual design... applied later" as future work.
This is that follow-up.

The user wants the site to feel like a 2026 product (Linear/Stripe/Apple/Framer/Vercel/
Figma-adjacent), not an incrementally-updated version of the old Bootstrap-card,
section-title portfolio. This is a large, multi-subsystem redesign — a shared design
foundation, the 3D hero interaction, and five independent page redesigns (About, Skills,
Projects, Portfolio, Contact). It is being decomposed into one sub-project per subsystem,
each with its own design → plan → implementation cycle. **This spec covers only the
foundation**: design tokens, the motion system, and the small set of components genuinely
shared across pages. No existing page is rewritten in this pass.

Out of scope for this pass: any individual page's redesign (About/Skills/Projects/
Portfolio/Contact — each gets its own later spec), the hero/3D interaction upgrade
(raycasting hover polish, camera-move-then-navigate — also its own later spec), light
mode, any backend/CMS.

## Current State (baseline)

- `src/styles/tokens.scss`: `$color-bg: #1f1f1f`, `$color-surface: #2c2f33`,
  `$color-text: #fff`, purple accent family (`$color-accent-purple: #b288c0`,
  `$color-hover-accent: #e4b7e5`), `$gradient-purple`/`$gradient-warm`. Fonts:
  `$font-heading: Ubuntu`, `$font-heading-serif: 'Inknut Antiqua'`,
  `$font-body: Unna`. One breakpoint: `$breakpoint-mobile: 768px`.
- No motion system exists — pages use only CSS `transition` on `:hover` states (e.g.
  opacity/color shifts on links). No scroll-driven animation anywhere.
- No shared "big heading / intro / stat / callout" components exist — each page
  hand-rolls its own heading markup and styling (see `about.astro`, `skills.astro`,
  `projects.astro` `<style>` blocks, which each redeclare near-identical heading rules).
- `Header.astro` is an opaque solid-color bar (`#23272a`), not sticky/scroll-aware.
- No motion library is installed (`gsap` is not currently a dependency).

## Visual Direction

Blended reference (not a single north star): dense/technical restraint from Linear and
Vercel, warmth and color confidence from Stripe, editorial whitespace and imagery
discipline from Apple. Concretely: a near-black canvas, one sharp accent color used
sparingly, large confident type carrying hierarchy instead of boxes and borders, motion
that reveals rather than decorates.

## Design Tokens (`src/styles/tokens.scss` — full replacement)

**Typography** — Single modern variable sans family: **Geist** (variable weight),
self-hosted or loaded via a single `<link>` in `BaseLayout.astro` (replacing the current
three-family Google Fonts `<link>`). **Geist Mono** for numeric/stat/tag-adjacent
accents (stats, tech chips, timestamps) — used sparingly, not a body font.

Fluid type scale via CSS `clamp()`, roughly:

| Token | Role | Approx range |
|---|---|---|
| `$font-size-display` | Hero-scale headlines | `clamp(2.5rem, 6vw, 6rem)` |
| `$font-size-h1` | Page headings | `clamp(2rem, 4vw, 3.5rem)` |
| `$font-size-h2` | Section headings | `clamp(1.5rem, 2.5vw, 2.25rem)` |
| `$font-size-body-lg` | Supporting/intro text | `clamp(1.125rem, 1.5vw, 1.375rem)` |
| `$font-size-body` | Default body text | `1rem` (16px, not fluid) |
| `$font-size-caption` | Labels, eyebrows, meta | `0.875rem` |

Body copy max-width capped around `65ch` wherever prose appears. Exact `clamp()` values
are tuned during implementation against real viewport testing, not treated as final.

**Color** — Near-black base, slate mid-layer, single sharpened violet accent:

| Token | Old value | New value (starting point, tuned during implementation) |
|---|---|---|
| `$color-bg` | `#1f1f1f` | `#0a0a0c` |
| `$color-surface` | `#2c2f33` | `#16171b` |
| `$color-text` | `#fff` | `#f2f2f4` (off-white, not pure white) |
| `$color-text-muted` | *(none)* | new — a mid-gray for secondary/caption text |
| `$color-accent` | `#b288c0` | `#8b5cf6`-ish (single accent, replaces the two-tone purple pair) |
| `$color-hover-accent` | `#e4b7e5` | a lighter tint of the new accent, same role (hover/highlight state) |
| `$gradient-accent` | `$gradient-purple` | soft accent-only gradient, reserved for hero glow / occasional headline treatment — not a default button/link style |

`$gradient-warm` (orange/pink, currently used on every page's section heading
underline) is retired — that per-page underline-gradient pattern is exactly the "section
titles" look being moved away from; individual pages replace it with `SectionIntro`
(below) in their own redesign passes.

**Spacing & radius** — 8px-based spacing scale (`$space-1: 0.5rem` through roughly
`$space-8: 4rem`+, named not numbered where it aids readability). Radius scale: small
(`6px`, inputs/chips), medium (`12px`, cards/panels) — replacing today's uniform `20px`
pill radius used almost everywhere.

**Shadow / glass** — One soft diffuse shadow token (large blur, low opacity — e.g.
`0 20px 60px -20px rgba(0,0,0,0.5)`, tuned during implementation) replacing the current
tight/dark card shadow. One glass recipe: `backdrop-filter: blur(16px)` (tuned) +
low-opacity surface fill + 1px low-opacity border — applied to `Header.astro` only in
this pass (see below); not a general-purpose token every component reaches for yet.

**Motion tokens** — Shared easing/duration constants (e.g. `$ease-out-expo` for reveals,
a shorter/snappier duration+easing pair for hover/interactive feedback) — consumed by
both plain CSS `transition` rules and the GSAP helpers below, so hand-written CSS
transitions and GSAP-driven animation feel like one system.

## Motion System

**Library** — GSAP core + the `ScrollTrigger` plugin only. Installed as a real
dependency (`gsap`), registered once.

**Location** — `src/lib/motion/`:
- `gsap-setup.ts` — imports GSAP + ScrollTrigger, registers the plugin, exports a
  configured `gsap` instance for the rest of the app to import from (single
  registration point, not repeated per component).
- `reveal.ts` — `revealOnScroll(element, options?)`: the shared fade/slide-up-on-scroll
  primitive every page's sections use by default. Pulls duration/easing from the Section
  1 motion tokens rather than hardcoding per call site.
- `reduced-motion.ts` — wraps `gsap.matchMedia()` so reduced-motion visitors get instant
  state changes (final opacity/position applied immediately, no tween) instead of the
  animation playing anyway at a shorter duration. This is a hard requirement, not a nice
  to have — mirrors the capability-gating discipline already established for the 3D hero.

**Astro view-transitions integration** — This site uses `<ClientRouter />`
(`BaseLayout.astro`), which does not re-run inline/module scripts on client-side
navigation. Motion setup that registers ScrollTriggers must therefore hook
`astro:page-load` (re-run setup on every navigation, including the first) and
`astro:before-swap` (kill/revert all ScrollTriggers for the outgoing page — `
ScrollTrigger.getAll().forEach(st => st.kill())` scoped appropriately — before the DOM
they're attached to is discarded). This is not a defensive guess: it's the exact class of
bug the 3D hero shipped with and had to fix in its own final review (the hero's mount
script needed the same `astro:page-load`/`astro:before-swap` pairing to avoid a leaked,
undead render loop). The shared `gsap-setup.ts` bakes this lifecycle handling in once so
individual pages don't have to remember it.

**Bundle impact** — GSAP+ScrollTrigger loads on every page that imports
`src/lib/motion/*` (which will be most pages, since `revealOnScroll` is the default
section-entrance pattern) — this is an accepted, real bundle-size cost, distinct from the
3D hero's much larger, capability-gated Three.js payload. Purely-CSS hover/transition
effects (color shifts, simple opacity on `:hover`) stay plain CSS and do not pull in
GSAP.

## Shared Components (Foundation scope)

Built now, in `src/components/ui/`, because they're reused across 2+ pages. Page-specific
components (`ProjectShowcase`, `TechnologyGrid`, `Timeline`, `ImageGallery`) are
explicitly deferred to their own page's future spec — not designed here.

- **`HeroTitle.astro`** — `Props { eyebrow?: string; title: string; supporting?: string }`.
  Renders a large display headline (`$font-size-display` or `$font-size-h1` depending on
  context — exposed as a `size` prop) with small supporting text underneath. No
  paragraph slot — enforces the "no walls of text under the headline" rule structurally,
  not just by convention.
- **`SectionIntro.astro`** — `Props { eyebrow?: string; title: string; description?: string }`.
  The small-label + heading + one-line-description pattern that replaces the current
  per-page gradient-underline section title. Animates in via `revealOnScroll` by default.
- **`StatCard.astro`** — `Props { value: string; label: string }`. Bare number/label
  pair, no card border/shadow by default (a `variant` prop may add a subtle surface if a
  future page genuinely needs grouping — not assumed here).
- **`Callout.astro`** — `Props { title?: string; children (slot) }`. A hairline-bordered,
  unfilled-or-near-unfilled surface for a short standalone note — the one component in
  this set allowed a visible border, per the "cards only when they improve readability"
  rule.
- **`FeatureSection.astro`** — `Props { title: string; description: string; media (slot); reverse?: boolean }`.
  Two-column media+copy block that flips left/right via the `reverse` prop — the
  alternating-layout mechanism future pages (Projects, possibly About) will compose with.

Each component: scoped `<style lang="scss">` importing only from `tokens.scss` (no
hardcoded colors/fonts/spacing — same discipline enforced on the hero work), animates its
own entrance via `revealOnScroll` internally by default (so consuming pages don't have to
remember to wire it up), and ships with no test (consistent with this project's existing
convention — Astro/Svelte presentational components are verified by build + manual
browser check, not unit tests).

## Header / Footer Changes

`Header.astro` gains the glass treatment: `position: sticky; top: 0`, transitions from
transparent to the glass recipe (blur + low-opacity fill + hairline border) once the page
has scrolled past a small threshold, via a small scroll listener (plain JS, not GSAP —
this is a binary state toggle, not a tweened animation) that also respects
`astro:page-load`/`astro:before-swap` for the same view-transition-safety reason as the
motion system. `Footer.astro` gets token updates (color/spacing) only — no structural
change in this pass.

## File Layout

```
src/
  styles/
    tokens.scss              # full replacement — Section "Design Tokens" above
  lib/
    motion/
      gsap-setup.ts
      reveal.ts
      reduced-motion.ts
  components/
    ui/
      HeroTitle.astro         # new
      SectionIntro.astro      # new
      StatCard.astro          # new
      Callout.astro           # new
      FeatureSection.astro    # new
      Header.astro            # modified — glass/sticky behavior
      Footer.astro            # modified — token updates only
```

No page under `src/pages/` is modified in this pass. `global.scss` gets updated for any
base element rules that reference retired tokens (e.g. font-family on `body`).

## Explicitly Out of Scope (future sub-projects)

- Individual page redesigns (About, Skills, Projects, Portfolio, Contact) — each gets
  its own spec, built against this foundation.
- Hero/3D interaction upgrade (raycasting hover highlight, click → camera move →
  navigate) — its own spec, absorbing the camera-follow-up work that was in flight when
  this redesign was requested.
- Light mode, any backend/CMS.
- `$gradient-warm` retirement's downstream cleanup on existing pages (those pages still
  reference it until their own redesign pass touches them — this spec only stops
  recommending it for new work, it does not chase down every existing usage).

## Verification

Consistent with this project's existing convention — no automated visual/UI test suite.

- `npm run check` and `npm run build` passing.
- Manual browser check: header glass/sticky behavior on scroll, at least one
  `revealOnScroll` instance firing correctly on scroll-into-view, `prefers-reduced-motion`
  emulation showing instant (non-animated) state, one client-side navigation
  (`astro:page-load`/`astro:before-swap`) to confirm motion setup survives it without
  duplicating or leaking ScrollTriggers.
- Kept minimal per the user's explicit guidance that browser-automation (Playwright)
  checks are credit-heavy — used only where a claim genuinely cannot be verified by
  reading code or build output.
