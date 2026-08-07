# About Page Redesign

Date: 2026-08-07
Status: Approved

## Goals & Scope

Third sub-project in the 2026 portfolio modernization series (`2026-08-06-portfolio-overhaul-design.md`), following Design Foundation and Hero/3D Interaction (both shipped). `src/pages/about.astro` is still on pre-redesign styling — deprecated `@import` tokens, the retired `$gradient-warm` underline, fixed pixel sizing — and was explicitly carried over as a "working baseline, not a finished redesign" by the original migration pass.

This pass restyles the existing About page with the design system Design Foundation shipped (tokens, motion, and the shared `src/components/ui/` components) without changing its content. Out of scope: rewriting or expanding the bio copy, adding new content (stats, timeline, quick-facts) — this is a pure visual restyle of what's already there (photo, heading, two bio paragraphs, CV download button).

## Current State (baseline)

`about.astro`: a single `#about` section, `.about-wrapper` flex row (photo + `.about-content`), fixed `height: 27rem`, photo at a fixed `20rem × 20rem` with a hardcoded `50px` border-radius. `.about-content` holds an `h1` (styled with the retired `$gradient-warm` underline via `::after`) and two `<p>` bio paragraphs. A `.resume-button` pill sits below, overlapping the section via a negative top margin, filled with a flat `$color-text` background that swaps to `$gradient-warm` on hover. Everything uses the deprecated `@import '../styles/tokens'` and legacy token aliases (`$font-heading`, `$font-body`). No motion — content is visible immediately, no scroll reveal.

## Layout

Two-column grid (photo one side, copy the other) — the most direct evolution of the current side-by-side layout, and it follows the same `1fr 1fr` grid pattern `FeatureSection.astro` established (collapsing to a single column on mobile), so About visually rhymes with whatever pattern Projects/Portfolio adopt later. Not literally built with the `FeatureSection` component, though: its shared-component API takes one `description` string, and About's two paragraphs cover distinct topics (professional focus, then personal/hobbies) that deserve to stay visually separate rather than being concatenated into one block. `about.astro` gets its own page-specific two-column markup that follows `FeatureSection`'s grid/breakpoint conventions and its `[data-reveal]` entrance behavior, without forcing the content through that component's narrower prop shape.

The whole two-column block enters as one `[data-reveal]` unit (fade + slide up via `revealOnScroll`, the same primitive `FeatureSection` and every other Foundation component use internally) — consistent with "each component animates its own entrance by default" from the Design Foundation spec, just implemented directly in this page's own markup rather than through a shared component.

## Content Treatment

- **Photo**: keeps its current rounded-square treatment, now using `$radius-md` (12px) instead of the old hardcoded `50px` — consistent with the Foundation's radius scale (`$radius-sm`/`$radius-md` replacing the previous uniform pill radius everywhere). Sizing adapts to the grid column rather than a fixed `20rem × 20rem`.
- **Heading**: a plain `<h1>An About Me</h1>` (text unchanged) styled directly with the new type tokens — `$font-sans`, `$font-weight-heading`, `$font-size-h1` — not the `HeroTitle` component. `HeroTitle` is built around an eyebrow + headline + one-line supporting text with **no paragraph slot** ("enforces the no walls of text under the headline rule structurally"), which doesn't fit a heading immediately followed by real prose paragraphs. The retired `$gradient-warm` underline is dropped entirely, not replaced with an equivalent — large confident type carries the hierarchy now, per the Foundation's visual direction, not a decorative underline.
- **Bio paragraphs**: both paragraphs preserved verbatim, styled with `$font-size-body-lg` / `$color-text-muted`, matching the type scale every other new component uses for body copy. Not capped at the full `$prose-max-width` (65ch) token — the two-column grid already narrows the copy column well below that width, so an additional cap would be redundant.
- **CV button**: solid accent-gradient pill (`$gradient-accent`), matching the hero's hotspot-nav-link pills — the clearer, more prominent of the site's two established button treatments (vs. the hero tooltip/social-icon glass-pill style), appropriate for what's the page's one clear call-to-action. Copy, `DocumentIcon`, and link target (`/pdf/JarrettDominicResume.pdf`) unchanged. Radius updates to `$radius-md`; hover state shifts to a brightness/opacity change on the same gradient rather than swapping to a different gradient (no second gradient token to swap to now that `$gradient-warm` is retired from this page).

## Responsive Behavior

Below `$breakpoint-mobile` (768px): grid collapses to a single column (photo stacked above copy), matching `FeatureSection`'s own mobile behavior. Photo centers; heading and paragraphs center-align, matching the current page's existing mobile treatment. CV button remains full-width-ish/centered below the copy.

## File Layout

```
src/pages/about.astro    # modified — full rewrite: markup, styles (migrated to
                          #   @use, new tokens, dropped $gradient-warm), and a
                          #   <script> importing initRevealElements-adjacent
                          #   wiring is NOT needed here — BaseLayout.astro
                          #   already calls initRevealElements()/teardown on
                          #   astro:page-load/astro:before-swap globally for
                          #   every [data-reveal] element on the page.
```

No other files change. No new shared components — this page's two-column markup is local to `about.astro`, not promoted to `src/components/ui/` (a second consumer, like a Projects redesign reaching for the same shape, would be the trigger to extract one).

## Explicitly Out of Scope (future work)

- Rewriting or expanding the bio copy (a separate, later pass, per the original migration spec).
- Any new content (stats row, timeline, quick facts).
- Extracting a shared "two-column media+copy with multi-paragraph support" component — not justified by a single consumer.

## Verification

Consistent with this project's established convention for presentational Astro components — no automated test; verified via `npm run check`, `npx svelte-check`, `npm run build`, and a manual browser check (desktop two-column layout, mobile stacked layout, scroll-reveal entrance, CV button link/hover).
