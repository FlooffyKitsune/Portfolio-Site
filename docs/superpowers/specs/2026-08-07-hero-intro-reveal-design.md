# Hero Intro Reveal — Loading Pulse, Coordinated Fade, Discovery Tooltip

Date: 2026-08-07
Status: Approved

## Goals & Scope

Third sub-project in the hero/3D area, following `2026-08-07-hero-3d-interaction-design.md`
(static camera, hover glow, fade-to-navigate — already shipped) and its two post-ship bug
fixes (dev-mode CSS drop, hover-flicker + text occlusion). This pass changes what visitors
see *before* the 3D model has finished loading, and adds a small discovery hint once it has.

Today, for 3D-capable visitors: the heading ("Hi, I am Jarrett Dominic."), tagline, wave
background, and fallback nav are all visible from first paint; once the model's `onready`
fires, the wave background and fallback nav instantly disappear (a raw `hidden` attribute
toggle, no animation) while the heading/tagline stay visible forever, permanently overlaid
on the 3D scene. This pass changes that: the heading/tagline/wave/fallback-nav become a
single "intro" group that fades out together (animated, not instant) once the model is
ready, fully revealing the 3D scene — plus a small pulsing indicator shows while the model
is still loading, and a small tooltip appears after the reveal to hint that the scene is
interactive.

Out of scope: any change to the mobile/reduced-motion/low-power fallback experience (stays
exactly as it is today — permanent heading/tagline/links, no pulse, no fade, no tooltip);
any change to the hover/click/highlight mechanics themselves (covered by the prior
sub-project and its fixes); the GitHub/LinkedIn social icon links (`.button-wrapper`), which
stay visible always, unaffected by this pass — the "obstruction" concern this pass addresses
is specifically about the readable text block, not the small corner icons.

## Current State (baseline)

- `index.astro`'s inline `<script>`: `setupHero()` runs on `astro:page-load`, checks
  `shouldUseSimplifiedHero()`, and if the visitor qualifies for 3D, dynamically imports
  `mount-hero-3d.ts` and calls `mountHero3D(root, { onready, onerror })`. `onready` calls
  `setFallbackHidden(true)`, which sets the `hidden` attribute on `#background` and every
  `[data-hero-links]` element instantly — no animation. `onerror` calls `teardownHero()` then
  `setFallbackHidden(false)` (defensive; these elements are never actually hidden at that
  point since `onready` never fired).
- Template: `#background` (wave `<img>`), `#hero-root` (3D mount point), `.landing-wrapper`
  containing `.landing-content` (`h1`, `p`, `.hotspot-links nav[data-hero-links]`) and
  `.button-wrapper` (GitHub/LinkedIn icon links). `h1`/`p` currently have no
  `pointer-events` override (pass through to the canvas, per the just-shipped hover-occlusion
  fix); `.hotspot-links a` and `.button-wrapper a` have `pointer-events: auto`.
- `mount-hero-3d.ts` exports `MountHero3DCallbacks { onready?, onerror? }`, threaded through
  `Hero3D.svelte`'s `Props` to `HeroScene.svelte`'s `Props`, which calls `onready?.()` once
  the glTF resolves (in the existing `gltf.then(...)` continuation) and `onerror?.(error)` on
  rejection.
- `HeroScene.svelte`'s `handlePointerMove` and `handleClick` already resolve
  `findHotspotObject`/`findHotspotId` against the raycast hit — both already have a clean
  "this hit is a genuine hotspot" branch to hook a new signal into.
- The site's shared GSAP instance (`src/lib/motion/gsap-setup.ts`) is already imported and
  used inside `HeroScene.svelte` for the click-to-navigate fade (`autoAlpha`, `expo.out`
  ease, 0.5s — a deliberately snappier "navigation gate" duration, distinct from the design
  foundation's `$duration-reveal` 0.8s used for scroll-triggered content reveals).
- No visitor with `prefers-reduced-motion` ever reaches any of this: `shouldUseSimplifiedHero()`
  already routes them to the static fallback before the 3D path is ever attempted, so nothing
  in this pass needs its own reduced-motion handling — consistent with how the click-fade
  overlay didn't need one either.

## Loading pulse

A small circular dot, `$color-accent`-colored, positioned in `.landing-content` directly
after the tagline `<p>`. Animates via a plain CSS `@keyframes` scale+opacity pulse loop (no
JS/GSAP needed for an indeterminate loop that starts automatically) — not a progress bar,
since there's no real download-progress signal easily available from `useGltf`/`useLoader`.

Hidden by default in the server-rendered HTML (`hidden` attribute) — visible only for
visitors actually on the 3D path, and only for the duration they're waiting. `setupHero()`
reveals it (removes `hidden`) the moment it commits to the 3D path — right after the
`shouldUseSimplifiedHero()` check passes, *before* the dynamic `import()` even starts, so the
loading signal begins as early as possible rather than only once the (larger, slower) model
download itself begins.

## Coordinated intro fade

Replace `setFallbackHidden`'s instant attribute toggle with a GSAP-animated group fade.
`#background`, `.landing-content` (now also covering the heading/tagline/pulse, not just the
links nav — one fewer thing to track separately), share one new marker attribute
(`data-hero-intro`), replacing the current narrower `data-hero-links` marker (which only
tagged the nav). On `onready`: `gsap.to('[data-hero-intro]', { autoAlpha: 0, duration: 0.8,
ease: 'expo.out', onComplete: () => elements.forEach(el => el.setAttribute('hidden', '')) })`
— the `0.8`s duration deliberately matches the design foundation's `$duration-reveal` (this
is a content reveal, not a navigation gate, so it gets the more unhurried of the two
established durations already in use elsewhere in this codebase). `autoAlpha` (not `opacity`)
so the group is genuinely `visibility: hidden` and non-interactive the instant the tween
starts settling, matching this project's established GSAP convention (`reveal.ts`, the
click-fade overlay). The explicit `setAttribute('hidden', '')` in `onComplete` is still
required even with `autoAlpha` — `hidden` is what actually removes the element from layout
flow, keeping parity with today's behavior (and importantly, actually disabling
`pointer-events: auto` on children like the hotspot-links `<a>` tags — `visibility: hidden`
alone would already stop them from receiving events, but `hidden` is the belt-and-suspenders
match for today's exact mechanism).

On `onerror`: unchanged in spirit from today — nothing was hidden yet (since `onready` never
fired), so no fade-back-in is needed for `#background`/`.landing-content`. The one addition:
also explicitly re-hide the loading pulse specifically (it's the one element this pass makes
visible *before* `onready`/`onerror` resolves either way), reverting cleanly to today's
plain static-fallback appearance.

## Tooltip

A small pill/card in the bottom-right corner of the hero, reading "Click around to explore" —
styled minimally (Geist type, `$color-accent` accent, no heavy chrome), consistent with the
rest of this site's restraint. Hidden by default (`hidden` attribute); GSAP-faded in
(`autoAlpha`, same `expo.out`/`0.8s` as the intro-group fade for consistency) once that fade's
`onComplete` fires — sequenced strictly after the reveal, not simultaneously with it, so the
visitor's attention lands on the newly-revealed scene first.

Dismissal: a new `oninteract` callback, threaded through the same prop chain as `onready`/
`onerror` (`HeroScene.svelte` → `Hero3D.svelte` → `mount-hero-3d.ts`'s
`MountHero3DCallbacks` → `index.astro`'s `mountHero3D(root, { onready, onerror, oninteract })`
call). `HeroScene.svelte` calls `oninteract?.()` from both `handlePointerMove` (in the
branch where `hotspotObject` is truthy — a genuine hotspot hover, not just any pointer move)
and `handleClick` (in the branch where a valid `hotspot` is resolved) — covering both
discovery paths. `index.astro`'s handler fades the tooltip out (`autoAlpha: 0`, quicker —
`0.3s`, since this is a "get out of the way" dismissal, not a content reveal) the first time
either fires; safe to call on every subsequent hover too, since GSAP tweening an
already-hidden element to its current state is a harmless no-op.

## File Layout

```
src/pages/index.astro                    # modified — template markers, script (pulse
                                          #   reveal, GSAP intro-fade, tooltip wiring),
                                          #   styles (pulse keyframes, tooltip, marker attr)
src/components/islands/Hero3D.svelte     # modified — thread oninteract through Props
src/components/islands/mount-hero-3d.ts  # modified — add oninteract to MountHero3DCallbacks
src/components/islands/HeroScene.svelte  # modified — call oninteract from
                                          #   handlePointerMove/handleClick
```

No change to `src/lib/three/*` (hotspot lookup/highlight logic untouched), no change to the
capability-detection gate itself, no change to the static fallback's own markup/behavior.

## Explicitly Out of Scope (future work)

- Any real download-progress indicator (would need `useLoader`'s `onProgress` wired through,
  a separate, larger investigation into whether that's reliably available/accurate for this
  loader chain).
- Tooltip content localization/copy iteration beyond the one string specified here.
- Any change to the fallback (non-3D) experience.

## Verification

Consistent with this project's established convention — no automated test for this UI
sequencing; `findHotspotObject`/`hotspot-highlight.ts`-level logic is unaffected and keeps
its existing Vitest coverage.

Manual verification (kept minimal per standing Playwright-cost guidance):

- `npm run check` / `npx svelte-check` / `npm run build` passing.
- Load `/`: pulse appears near the heading almost immediately (before the model finishes),
  heading/tagline/wave/links all still visible and functioning (fallback links clickable)
  during this window.
- Once loaded: heading, tagline, pulse, wave background, and fallback nav all fade out
  together as one smooth animation (not an instant snap) — 3D scene fully revealed
  afterward, tooltip fades in shortly after that.
- Hover or click a hotspot: tooltip fades out.
- Navigate away and back to `/`: sequence repeats correctly from a fresh page load (no stale
  state from the previous mount — matches the existing remount-safety work already done for
  this component).
- Resize below the mobile breakpoint or emulate `prefers-reduced-motion: reduce`: confirm the
  fallback experience is completely unaffected — no pulse, no fade, no tooltip, permanent
  heading/links exactly as today.
