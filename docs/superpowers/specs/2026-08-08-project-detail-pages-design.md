# Project Card Refinement & Optional Detail Pages — Design

## Goal

Refine the Projects page's card visual treatment and add optional
per-project detail pages at `/projects/[slug]`, without touching the
Portfolio page, its content, or its schema, and without rewriting any
existing project content.

## Card refinement (`WorkCard.astro`)

Builds on the grid-card redesign already shipped (image top, content
below, tag badges, bottom-pinned action chips, whole-card hover with
lift/border/image-zoom). Refinements:

- More breathing room in the content area: padding `$space-4` →
  `$space-5`, inter-element gap `$space-2` → `$space-3`.
- Slightly stronger title hierarchy: `1.25rem` → `1.375rem`.
- Image stays the dominant visual element (already `aspect-ratio: 16/9`,
  `object-fit: cover`, full card width, zooms subtly on hover) — no
  change to the image treatment itself, just more room around it via the
  content-area spacing above.
- No new hover effects beyond what's already shipped (lift, border
  brighten to `rgba($color-accent, 0.4)`, soft shadow, image
  `scale(1.04)`) — the brief asks for "a" subtle interaction, which this
  already satisfies.
- Card height consistency within a row and the responsive
  `repeat(auto-fill, minmax(20rem, 1fr))` grid (naturally 3 → 2 → 1
  columns) are already correct from the prior pass — unchanged.

## Whole-card click-through for detail pages

- The project title becomes a real `<a href={detailsUrl}>` **only** when
  `detailsUrl` is passed to `WorkCard` (new optional prop). The anchor
  uses the standard "stretched link" pattern: `position: absolute;
  inset: 0;` on a `::after` pseudo-element of the title link, with
  `.work-card { position: relative; }` — this makes the entire card
  clickable/hoverable as a single target without wrapping the whole card
  markup in an `<a>` (which would make the nested GitHub/Demo `<a>`s
  invalid HTML).
- `.work-links` gets `position: relative; z-index: 1;` so those chips sit
  above the stretched overlay and remain independently clickable —
  clicking GitHub/Demo does not navigate to the detail page.
- When `detailsUrl` is not passed (every Portfolio card, and any Projects
  entry with `detailsPage: false`/unset), the title renders as plain
  text exactly as today — zero behavior change for those cards.

## Schema (`src/content.config.ts`)

`portfolio`'s schema is untouched. `projects` gets its own schema,
`workEntry.extend({...})`, so the base `workEntry` (still used by
`portfolio`) is never modified:

```ts
const projectEntry = workEntry.extend({
	shortDescription: z.string().optional(),
	detailsPage: z.boolean().optional().default(false),
	featured: z.boolean().optional().default(false)
});
```

- `shortDescription`: optional one-liner shown on the detail page's hero
  subtitle. Falls back to the existing `description` field if absent —
  no new content required for existing entries.
- `detailsPage`: gates both route generation (`getStaticPaths` only
  emits paths for entries where this is `true`) and card linking. Not
  set → today's exact card/route behavior (no link, no route).
- `featured`: included per the requested field list for future use; no
  visual behavior is wired to it in this pass (none was specified) —
  it's just available on the data model already.
- No `slug` field: the content-layer `glob()` loader already gives every
  entry an `id` derived from its filename (e.g. `h2g2` for `h2g2.md`),
  used directly as the route param. Adding a separate `slug` field would
  just be a second thing to keep in sync with the filename for no
  benefit.
- No rename of `stack` → `technologies` or `links` → `github`/`demo`:
  the existing fields already serve those exact roles, `links` supports
  Portfolio's differently-labeled entries ("Before/After", "Example")
  that a rigid `github`/`demo` pair could not, and renaming would touch
  `WorkCard` and both content collections for no functional gain.
- The existing `description` field's role is unchanged for the card (its
  current use today); on the detail page it doubles as the "longer
  project description" paragraph — already-authored text, no new
  writing required.
- Optional additional sections (Overview, What I Built, Technical
  Details, Challenges, Results, Screenshots, or anything else) are not a
  schema field at all — they're the Markdown **body** of the project's
  `.md` file, authored as normal `## Heading` sections and rendered via
  Astro's `<Content />`. This is what makes sections truly optional
  (whatever headings exist, exist) and keeps adding project content a
  matter of writing Markdown, not extending a schema. All 6 existing
  entries currently have empty bodies, so this section is simply absent
  for them until content is added.

## Route: `/projects/[slug].astro`

- `getStaticPaths()` reads `getCollection('projects')`, filters to
  `entry.data.detailsPage === true`, and returns `{ params: { slug:
  entry.id }, props: { entry } }` for each. Projects without
  `detailsPage: true` generate no route at all (a stray visit to their
  URL 404s, matching "do not create unnecessary routes").
- Layout (reusing existing shared components/tokens, no new dependency):
  - "← Back to Projects" link (`/projects`) at the top.
  - `HeroTitle` — `title` = project title, `supporting` =
    `shortDescription ?? description`.
  - Hero project image, full-width, larger presence than the card's
    thumbnail crop (e.g. `max-height: 28rem`, `object-fit: cover`,
    rounded corners matching the site's `$radius-md` card language).
  - Tech-stack tag badges — same compact badge treatment as the card,
    reused via the same CSS pattern (not a shared component extraction —
    two usages doesn't justify one yet, consistent with this project's
    existing threshold for componentizing).
  - GitHub/Demo link chips — same ghost/bordered chip treatment as the
    card's action buttons, sized slightly larger for a standalone page.
  - `description` rendered as a body paragraph.
  - Markdown body content (`<Content />`) rendered below, if the entry's
    body is non-empty — headings/paragraphs styled via a page-scoped
    `:global()` block matching site typography (`$font-sans`,
    `$color-text`/`$color-text-muted`, `$space-*` rhythm) so arbitrary
    author-written sections read consistently without new components.

## Non-goals / explicitly preserved

- No changes to Portfolio's page, schema, content, or card behavior.
- No changes to About, Skills, Contact, or the homepage.
- No rewriting of existing project descriptions or content — the 3
  existing entries keep their current `description` text and get no new
  authored `shortDescription` or Markdown body content in this pass.
- No image-optimization pipeline change — project images stay plain
  string paths under `public/images/projects/`, `<img>` tags, matching
  today's `WorkCard` handling (not migrated to `astro:assets`, which
  only About's photo currently uses).
- No new external dependencies.
