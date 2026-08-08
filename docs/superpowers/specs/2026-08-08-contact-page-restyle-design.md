# Contact Page Restyle — Design

## Goal

Migrate `src/pages/contact.astro` off its legacy pre-2026 styling (old
`$font-heading`/`$color-hover-accent` tokens, plain `@import`, flat centered
stack) onto the current design system already established on the About and
Skills pages — same content, same information architecture, new visual
language. Pure restyle: no content or copy changes.

## Scope

In scope:
- Rebuild the page's markup and styles using current tokens and the shared
  `HeroTitle` component.
- Bring the email link and social icons up to the current visual language
  (glass-pill chrome, accent hover states, `$gradient-warm` heading).
- Wire the page into the shared `[data-reveal]` scroll-reveal system.

Out of scope:
- Any new content (no contact form, no availability blurb, no new links).
- Any new shared components — this page reuses `HeroTitle` only; it does
  not need `Callout` since the design is a flat, cardless layout (see
  Layout below).

## Layout

Flat, centered, cardless — matching the current page's overall shape rather
than introducing a card container. Vertically stacked:

1. `HeroTitle` — `title="Contact"`, `size="h1"`, `supporting="Have a
   project in mind or just want to say hi? Reach out."` (unchanged copy).
   `HeroTitle`'s `h1` gets the same `:global()` `$gradient-warm` text-fill
   override already used on About/Skills, for visual consistency across
   all three migrated pages.
2. Email link — `mailto:jarrettdominic@proton.me`, icon + visible address
   text (unchanged content). Kept as real text, not icon-only, for
   accessibility and copy/paste.
3. Social icon row — GitHub and LinkedIn icons (unchanged links), each
   rendered as a circular glass-pill button.

The whole block (`section#contact`'s inner wrapper) carries `data-reveal`,
consistent with `about.astro`'s single-wrapper approach.

## Styling details

- File migrates from `@import '../styles/tokens'` to
  `@use '../styles/tokens' as *`, and from legacy aliases
  (`$font-heading`, `$font-body`, `$color-hover-accent`) to canonical
  tokens (`$font-sans`, `$color-accent`, `$color-text`, etc.), matching
  About/Skills.
- **Email link:** sized at `$font-size-h2` for primary-CTA prominence
  (up from the old flat `1.5rem`), `$color-text` at rest, transitions to
  `$color-accent` on hover (replacing the old `$color-hover-accent`
  swap). Icon inherits `currentColor` as today.
- **Social icons:** each wrapped in a circular button using the site's
  existing glass-pill recipe (`background: $glass-fill`,
  `border: 1px solid $glass-border`, `backdrop-filter: blur($glass-blur)`),
  fixed at `2.75rem` diameter (a comfortable touch target) with the icon
  glyph at `1.25rem` centered inside, `border-color` brightening to
  `rgba($color-accent, 0.6)` on hover (the same hover recipe Skills' chips
  use), replacing the old bare oversized-glyph treatment.
- Spacing uses the `$space-*` scale (e.g. `$space-6`/`$space-8` between
  heading, email, and icon row) rather than the old page's raw `rem`
  values.
- Mobile breakpoint (`$breakpoint-mobile`) keeps the same centered
  stack — no layout change needed since the page is already
  single-column at all widths.

## Motion

- Wrap the content block in `data-reveal`, consistent with About and
  Skills, so it fades/slides in via the shared `revealOnScroll` /
  `initRevealElements` system (`src/lib/motion/reveal.ts`) instead of
  appearing statically as it does today.

## Non-goals / explicitly preserved

- Content, copy, and links are byte-for-byte unchanged: same heading
  text, same supporting line, same email address, same GitHub/LinkedIn
  URLs.
- No new icons need adding to `src/components/ui/icons.ts` — `mdi/email`,
  `mdi/github`, `mdi/linkedin` are already present and already used by
  this page today.
