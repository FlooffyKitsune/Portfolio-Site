# Skills Page Redesign

Date: 2026-08-08
Status: Approved

## Goals & Scope

Fourth sub-project in the 2026 portfolio modernization series, following Design Foundation, Hero/3D Interaction, and About (all shipped). `src/pages/skills.astro` is still on pre-redesign styling — deprecated `@import` tokens, the retired `$gradient-warm` underline, and the legacy `SkillGroup.astro` card component (heavy box-shadow, `$color-surface` fill, uniform 20px radius) — none of which reflects the 2026 design system.

Unlike About (a pure restyle), this pass also **replaces the skills content**: the current three categories (Front-end/Back-end/Tools, ~23 items) no longer reflect the About page's newly-revised bio, which now describes game development (Godot), 3D/2D creative work (Blender, Clip Studio Paint), and creative tooling. This spec covers both the new content and its visual presentation.

## New Content

Five categories, replacing the current three in full:

**Languages**: TypeScript, JavaScript, Python, Java, PHP, Lua, SQL, HTML, CSS

**Full-Stack Development**: React, Svelte, Astro, Next.js, Node.js, REST APIs, MySQL, MongoDB, Firebase, Three.js, Supabase

**Game Development**: Godot, Game Systems, Gameplay Programming, UI / UX, 3D Asset Integration

**Creative**: Blender, Clip Studio Paint, 3D Modeling, 3D Animation, 2D Illustration, UI Design, Graphic Design

**Tools & Infrastructure**: Git, GitHub, VS Code, Docker, AWS, Adobe Creative Suite

`src/data/skills.ts`'s existing `SkillItem { label, iconKey }` / `SkillGroup { title, items }` interfaces are unchanged — only the exported `skillGroups` array's content changes to the above.

## Icon Strategy

About half these items are concrete tools/languages with real brand icons; the rest (Game Systems, Gameplay Programming, UI / UX, 3D Asset Integration, 3D Modeling, 3D Animation, 2D Illustration, UI Design, Graphic Design, REST APIs, SQL) are skills/disciplines with no brand mark. Every item still gets an icon — real brand icon where one exists, a sensible generic icon (Material Design Icons, `mdi/*`, already available via the project's full `@iconify/json` dependency) otherwise — rather than a mixed icon/no-icon list, which would read as inconsistent.

Full mapping (✱ = new import needed in `src/components/ui/icons.ts`; unmarked = already imported and reused as-is):

| Item | Icon key |
|---|---|
| TypeScript | `simple-icons/typescript` |
| JavaScript | `simple-icons/javascript` |
| Python | `simple-icons/python` |
| Java | `fa-brands/java` |
| PHP | `simple-icons/php` |
| Lua | `simple-icons/lua` ✱ |
| SQL | `mdi/database` ✱ |
| HTML | `simple-icons/html5` |
| CSS | `simple-icons/css3` |
| React | `simple-icons/react` |
| Svelte | `simple-icons/svelte` |
| Astro | `simple-icons/astro` ✱ |
| Next.js | `simple-icons/nextdotjs` ✱ |
| Node.js | `simple-icons/nodedotjs` |
| REST APIs | `mdi/api` ✱ |
| MySQL | `simple-icons/mysql` |
| MongoDB | `simple-icons/mongodb` |
| Firebase | `simple-icons/firebase` |
| Three.js | `simple-icons/threedotjs` ✱ |
| Supabase | `simple-icons/supabase` ✱ |
| Godot | `simple-icons/godotengine` ✱ |
| Game Systems | `mdi/gamepad-variant-outline` ✱ |
| Gameplay Programming | `mdi/application-brackets-outline` ✱ |
| UI / UX | `mdi/view-dashboard-outline` ✱ |
| 3D Asset Integration | `mdi/cube-scan` ✱ |
| Blender | `simple-icons/blender` |
| Clip Studio Paint | `mdi/brush-variant` ✱ (no brand icon exists in any available collection — verified) |
| 3D Modeling | `mdi/cube-outline` ✱ |
| 3D Animation | `mdi/animation-play-outline` ✱ |
| 2D Illustration | `mdi/pencil-outline` ✱ |
| UI Design | `mdi/palette-swatch` ✱ |
| Graphic Design | `mdi/palette` ✱ |
| Git | `simple-icons/git` |
| GitHub | `simple-icons/github` |
| VS Code | `simple-icons/visualstudiocode` |
| Docker | `simple-icons/docker` ✱ |
| AWS | `simple-icons/amazonaws` (existing alias, resolves to the `amazonwebservices` icon) |
| Adobe Creative Suite | `simple-icons/adobecreativecloud` |

`icons.ts` is purely additive — nothing existing is removed. Several currently-unused-by-Skills entries (`sass`, `redux`, `npm`, `yarn`, etc.) are still consumed by `WorkCard.astro`'s project tech-stack tags, which are out of scope for this pass.

## Layout

`HeroTitle` (title="Skills", no eyebrow, no supporting line — the five category names and ~40 chips below already carry the page's content) for the top-of-page heading, replacing the current `$gradient-warm`-underlined `<h1>`.

Below it, one block per category: `SectionIntro` (title only — category name, no eyebrow/description) followed by a wrapped row of chips, one per item. Both are shared Design Foundation components (`src/components/ui/`), each already wired to fade/slide in via `revealOnScroll` internally — no manual GSAP needed in this file, matching the pattern already established in the About redesign.

**Chip style**: quiet, not the hero's bold accent-gradient pills. Icon + label, `1px solid $glass-border`, near-transparent `$glass-fill` background, `$radius-sm` (chips are small UI, not cards), `$color-text` label. A dense list of ~40 items reads as calm information this way, rather than ~40 items in bold gradient competing with each other for attention — that treatment suits the hero's single primary CTA, not this page's informational density. No chip component exists yet in `src/components/ui/`; this is page-local markup in `skills.astro`, matching how the About redesign built its own two-column layout rather than force-fitting content into a shared component with the wrong shape. A single page consuming this shape isn't reason enough to extract a shared component (same reasoning as About's `FeatureSection` decision) — that trigger is a second consumer.

## Responsive Behavior

Chips wrap naturally at any width (`flex-wrap`) — no breakpoint-specific layout change needed beyond the page's existing `$breakpoint-mobile` padding/heading-centering conventions already used elsewhere on this site.

## File Layout

```
src/pages/skills.astro           # modified — full rewrite: markup (HeroTitle +
                                  #   per-category SectionIntro + chip rows),
                                  #   styles (chip recipe, migrated to @use)
src/data/skills.ts                # modified — full content replacement (5
                                  #   categories per "New Content" above)
src/components/ui/icons.ts        # modified — additive: 19 new icon imports
                                  #   per the "Icon Strategy" table above
```

No new shared components. No other files change.

## Explicitly Out of Scope (future work)

- `WorkCard.astro` and the Projects/Portfolio pages that use it — separate future sub-projects.
- Any further content changes to the skills list beyond what's specified here.
- Extracting a shared chip/tag component — not justified by a single consumer.

## Verification

Consistent with this project's established convention — no automated test for this page; verified via `npm run check`, `npx svelte-check`, `npm run build`, and a manual browser check (desktop chip wrapping across all five categories, mobile layout, scroll-reveal entrance, icon rendering for both brand and generic icons).
