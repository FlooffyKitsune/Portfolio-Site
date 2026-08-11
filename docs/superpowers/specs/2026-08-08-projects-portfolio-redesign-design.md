# Projects & Portfolio Pages Redesign — Design

## Goal

Migrate `src/pages/projects.astro`, `src/pages/portfolio.astro`, and the
shared `src/components/ui/WorkCard.astro` off their legacy pre-2026 styling
onto the current design system already established on About, Skills, and
Contact. Both pages are structurally identical today (same `WorkCard`
component, same case-study row layout, differing only by which content
collection they read from and their heading text) and stay structurally
identical after this pass — the redesign is one shared component update
plus two page-shell updates, not two independent designs.

## Content context (unchanged by this pass)

- **Projects** (`src/content/projects/`): coded software work — H2G2,
  YT-App, this portfolio site. Each entry has a tech-stack icon row and
  typically two links (GitHub + a live demo).
- **Portfolio** (`src/content/portfolio/`): commissioned creative/design
  work — 35 Below, Caffeine, Miscellaneous Work. Each entry has a
  design-tool icon row (Adobe/Blender/Autodesk) and typically one link
  (a view/example/before-after reference).
- `links` per entry is already a variable-length array (0 or more) in the
  content schema — no schema change needed to support entries with fewer
  or no demo links going forward.

## Layout

Unchanged shape: one case-study row per entry (image beside content),
stacked vertically, full page width — not a card grid. This preserves
full-length, untruncated descriptions and keeps the visual departure from
today's layout to styling only, not structure.

## Page shells

Both `projects.astro` and `portfolio.astro`:

- Replace the plain `<h1>` with `HeroTitle` (`size="h1"`), each with its
  own `title` + `supporting` copy:
  - **Projects:** title "Projects", supporting "Software and web projects
    I've built end to end, from quick experiments to full applications."
  - **Portfolio:** title "Portfolio", supporting "Commissioned design and
    creative work — branding, illustration, and visual identity for
    clients."
- `HeroTitle`'s `h1` gets the same `:global()` `$gradient-warm` text-fill
  override already used on About/Skills/Contact, so all migrated pages
  share the same heading treatment.
- Each rendered `WorkCard` carries its own `data-reveal`, giving a
  staggered scroll-in per entry (same pattern as Skills' `Callout` cards).
- Migrate off `@import '../styles/tokens'` to `@use '../styles/tokens' as
  *`, and off legacy token aliases (`$font-heading`) to canonical names.

## `WorkCard` redesign

Current state: legacy `@import`, oversized raw font sizes (2.5rem
title, 1.5rem body/links), a heavy drop-shadow, solid `$gradient-purple`
pill buttons for every link regardless of count, no hover states, no
reveal wiring.

New treatment:

- **Surface:** hairline-bordered glass card — `border: 1px solid
  $glass-border`, `background: $color-surface`, `border-radius:
  $radius-md`, `overflow: hidden` (clips the image to the card's own
  corners) — replacing the box-shadow, matching `Callout`'s card language
  used on About and Skills.
- **No whole-card hover effect.** The card itself is not a single link —
  it holds multiple independent links — so a card-level hover glow would
  misrepresent it as one clickable unit. Hover affordance stays scoped to
  the actual interactive elements (the link chips).
- **Title:** `$font-size-h2` (down from the current raw `2.5rem`),
  `$font-weight-heading`, `$color-text`.
- **Description:** current body copy at a readable size
  (`$font-size-body-lg`), `$color-text-muted`, `line-height: 1.6` —
  matching the prose treatment already used in About's bio paragraphs.
- **Tech-stack icons:** small, muted (`color: $color-text-muted`), no
  behavior change — still a plain row of brand icons, just restyled to
  the current spacing scale instead of raw `rem` padding.
- **Link chips:** replace the solid `$gradient-purple` pill buttons with
  the same ghost/bordered chip treatment Skills uses for its skill chips
  — `border: 1px solid rgba($color-accent, 0.25)`, `background:
  rgba($color-accent, 0.08)`, hover brightens the border to
  `rgba($color-accent, 0.6)`. Reads calmer with 1-2 links per card and
  doesn't compete visually with the page's other accent usage.
- **Image:** unchanged placement (beside content) and `object-fit:
  cover`; corner rounding now comes from the card's own `overflow:
  hidden` rather than a separate radius on the `<img>`.
- **Spacing:** migrate all raw `rem` padding/margin values to the
  `$space-*` scale.
- Migrate off `@import` to `@use '../../styles/tokens' as *` and off
  legacy aliases (`$font-heading`, `$font-body`) to canonical names.

## Motion

- Each `WorkCard` instance carries `data-reveal`, wired into the existing
  shared `revealOnScroll`/`initRevealElements` system
  (`src/lib/motion/reveal.ts`) — no changes needed to that system itself.

## Non-goals / explicitly preserved

- No layout restructure (row-based case studies stay, not a grid).
- No content/copy changes to existing project or portfolio entries —
  descriptions, links, and stack icons are unchanged. (Content revisions
  planned for later, e.g. swapping in projects without demo links, are
  out of scope for this pass and already supported structurally by the
  existing variable-length `links` array.)
- No new shared components — reuses `HeroTitle` only, plus `WorkCard`
  itself (redesigned in place, not replaced).
- No changes to the content collection schema
  (`src/content/config.ts` or equivalent).
- No changes to any other page (About, Skills, Contact, homepage).
