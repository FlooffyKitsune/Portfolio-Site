# Portfolio Overhaul — Architecture & 3D Hero Design

Date: 2026-08-06
Status: Approved

## Goals & Scope

Rework the portfolio from a single-page SvelteKit scroller into a multi-page
Astro + Svelte-islands site, with a Three.js hero on the homepage: a
pre-built 3D model with clickable hotspots that navigate to the site's other
sections.

This pass covers architecture, routing, styling system, and the 3D hero —
built with content migrated from the current site (not placeholders), since
much of the existing copy will carry over as-is. Final visual polish/design
direction is applied later, informed by the `taste-skill` framework during
implementation, not decided in this spec.

Out of scope for this pass: the final copy rewrite the user is separately
preparing, light mode, any backend/CMS, and any sections beyond the five
listed below.

## Current State (baseline)

- SvelteKit 2 + Svelte 4 + TypeScript, single route (`src/routes/+page.svelte`)
  that stacks `Header`, `About`, `Skills`, `Projects` components, navigated
  via `#anchor` links.
- No design tokens: colors (`#1f1f1f`, `#2c2f33`, pink/orange gradient) and
  fonts (`Ubuntu`, `Unna`, `Inknut Antiqua`) are hardcoded/repeated per
  component; each component re-imports the same Google Fonts URLs.
- Icons via `unplugin-icons` (`virtual:icons/...` imports), Vite plugin —
  compatible with Astro unchanged.
- `Projects.svelte` mixes code projects (Portfolio, YT-App, H2G2) with
  design/art work (35 Below, Caffeine, Misc) in one hardcoded list.
- `Skills.svelte` lists icons grouped by Front-end / Back-end / Tools.
- Hosted on Vercel (per existing project copy).
- No test suite; no `docs/` or `CLAUDE.md` present prior to this spec.

## Stack & Rendering

- **Astro** (latest) as the framework, with the `@astrojs/svelte` integration
  for islands.
- **TypeScript** throughout.
- **Output: `static`** — no server-side logic is required; Vercel serves the
  build directly. A backend (e.g. a serverless function for a contact form)
  is an explicit future addition, not required now.
- **`unplugin-icons`** carries over unchanged.
- **Threlte** (`@threlte/core`, `@threlte/extras`) for the Three.js hero,
  since it renders as a Svelte island.
- **Prettier** stays, with the Astro Prettier plugin added for `.astro`
  files.

## File / Folder Structure

```
src/
  content/
    config.ts              # Content Collection schemas (zod)
    projects/               # code projects — one .md per project
      portfolio-site.md
      yt-app.md
      h2g2.md
    portfolio/               # art/design work — one .md per piece
      35-below.md
      caffeine.md
      misc-work.md
  components/
    islands/                 # hydrated (client) Svelte components
      Hero3D.svelte           # Threlte scene
      Hero3DFallback.svelte   # static/simplified mobile version
    ui/                       # static Astro components, no hydration
      Header.astro
      Footer.astro
      ProjectCard.astro
      SkillGroup.astro
  data/
    skills.ts                 # structured skills data (grouped by category)
    hotspots.ts                # hero hotspot → route mapping (shared by
                                # Hero3D and Hero3DFallback)
  layouts/
    BaseLayout.astro           # <head>, Header, Footer, global wrapper
  pages/
    index.astro                 # home — 3D hero
    about.astro
    skills.astro
    projects.astro
    portfolio.astro
    contact.astro
  styles/
    tokens.scss                 # design tokens: color, type scale, spacing
    global.scss                  # resets, base element styles
  lib/
    three/
      scene-config.ts            # camera/lighting/model constants
public/
  models/
    hero.glb                     # user-provided 3D model
  images/ ...                    # as today
  pdf/ ...                       # as today
```

**Projects** and **Portfolio** (art/design work) become separate Content
Collections instead of one hardcoded `.svelte` file — this is the split
of the current `Projects.svelte` content. **Skills** stays a plain typed
data file (`data/skills.ts`), not a collection, since it's structured icon
lists rather than prose. The hotspot-to-route mapping lives in one shared
file (`data/hotspots.ts`) so the 3D scene and its mobile fallback read from
a single source of truth — no duplicated destination lists to drift apart.

## Content Data Schemas

`content/config.ts` defines two collections:

```ts
projects: {
  title: string
  description: string
  stack: string[]       // icon keys, resolved via unplugin-icons in ProjectCard.astro
  links: { github?: string; demo?: string }
  image: string
}

portfolio: {
  title: string
  description: string
  tools: string[]        // icon keys
  links: { url?: string; label?: string }
  image: string
}
```

Both collections migrate 1:1 from the current `Projects.svelte`: code
projects (Portfolio, YT-App, H2G2) go to `content/projects/`; design work
(35 Below, Caffeine, Misc) go to `content/portfolio/`.

`data/skills.ts` mirrors today's three groups (Front-end, Back-end, Tools)
and their items, as a typed array instead of duplicated markup.

## Styling / Design Tokens

`styles/tokens.scss` centralizes what's currently copy-pasted across every
component: the pink/orange gradient colors, `#1f1f1f` background, `#2c2f33`
card color, and the `Ubuntu` / `Unna` / `Inknut Antiqua` font families — as
SCSS variables. This is structured so a future light mode could migrate
these to CSS custom properties without a rewrite, but the site stays
single-theme (dark) for this pass.

Google Fonts are loaded once in `BaseLayout.astro` instead of re-imported
per component. `styles/global.scss` holds the reset
(`* { margin: 0; padding: 0; box-sizing: border-box; }`) once instead of
repeated per-component.

## 3D Hero & Hotspot Navigation

- `Hero3D.svelte` is hydrated with `client:visible` on `index.astro`. It
  loads `public/models/hero.glb` via Threlte's GLTF loader, and sets up
  camera/lighting from `lib/three/scene-config.ts`.
- Hotspots are named meshes (or empty objects) in the `.glb`, matched
  against entries in `data/hotspots.ts` (mesh name → route + label, e.g.
  `"about-node" → /about`). Threlte's built-in interactivity provides
  hover (cursor + highlight state) and click → navigation to the mapped
  route.
- `Hero3DFallback.svelte` renders instead of `Hero3D.svelte` on mobile,
  `prefers-reduced-motion`, or detected low-power devices: a static hero
  image (exported from the same model) with an overlaid tappable list of
  the same hotspots, sourced from the same `data/hotspots.ts`.
- The choice between `Hero3D` and `Hero3DFallback` is made in `index.astro`
  via viewport width + `matchMedia('(prefers-reduced-motion: reduce)')` +
  a lightweight capability check — so mobile visitors never download the
  Three.js/Threlte bundle at all.

## Navigation & Layout

`Header.astro`, rendered by `BaseLayout.astro` on every page, carries a
persistent nav (About / Skills / Projects / Portfolio / Contact) linking to
the same destinations as the hero hotspots. The 3D hero is the homepage's
first-impression entry point, never the only way to move around the site.

Astro's View Transitions (`<ClientRouter />` in `BaseLayout.astro`) provide
smooth cross-page navigation without a full SPA router.

## Pages

| Route         | Content                                                    |
|---------------|-------------------------------------------------------------|
| `/`           | 3D hero (or mobile fallback) + hotspot navigation           |
| `/about`      | Migrated About copy + photo                                 |
| `/skills`     | Migrated skills lists (Front-end / Back-end / Tools)        |
| `/projects`   | Code projects, from the `projects` collection                |
| `/portfolio`  | Art/design work, from the `portfolio` collection              |
| `/contact`    | New — method TBD at implementation (likely mailto/socials to start, no backend required) |

## Migration Plan

1. Scaffold the Astro project structure in this repo, replacing the
   SvelteKit setup.
2. Migrate existing copy: About paragraphs, Skills lists, current Projects
   entries into the `projects` collection, and current design work (35
   Below, Caffeine, Misc) into the `portfolio` collection.
3. Build `Header.astro` / `Footer.astro` / `BaseLayout.astro`; wire up all
   five content pages with migrated data, styled via the new token system.
4. Build the Threlte hero + mobile fallback + hotspot navigation against the
   user-provided `hero.glb`.
5. Add the Contact page.

## Explicitly Out of Scope (future work)

- The final visual design/copy rewrite the user is separately preparing —
  this pass preserves existing text as a working baseline, not a finished
  redesign of the words themselves.
- Light mode.
- Any backend/CMS.
- Blog or other sections not listed above.

## Verification

No test suite exists for this project (portfolio site). Verification for
this work is:

- `astro check` and `npm run build` passing.
- Running the dev server and checking each page renders with migrated
  content.
- Checking the 3D hero interaction and hotspot navigation in-browser.
- Checking the mobile-width fallback (simplified hero + tappable hotspot
  list).
