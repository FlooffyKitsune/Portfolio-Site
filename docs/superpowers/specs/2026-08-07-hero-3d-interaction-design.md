# Hero 3D Interaction — Static Camera, Hover Highlight, Fade-Through Navigation

Date: 2026-08-07
Status: Approved

## Goals & Scope

Second sub-project of the portfolio modernization (see
`2026-08-07-design-foundation-design.md` for the first). The homepage's 3D hero scene
(`src/components/islands/HeroScene.svelte`) currently auto-rotates the room and navigates
instantly on hotspot click via a raw `window.location.href`. This pass replaces both: the
scene becomes a fully static, locked-camera view "standing in the room looking at the
desk," hovering a hotspot gives it a subtle accent-colored glow, and clicking fades the
screen through the new accent color before navigating via Astro's client-side transitions
instead of a full page reload.

This also absorbs a piece of already-drafted, uncommitted work: `HeroScene.svelte`
currently has an unstaged change that sources the camera from the model's own embedded
Camera object (set up in Blender) instead of the hardcoded `cameraPosition`/`cameraFov`
constants. That work is folded into this plan rather than landing separately.

Out of scope: any change to the hotspot **click-to-route mapping** (`src/data/hotspots.ts`
is untouched), the mobile/reduced-motion/low-power static fallback (`.hotspot-links` in
`index.astro` — already built, already accessible, not touched here), the model file
itself, and any other page's redesign (separate future sub-projects).

## Current State (baseline)

- `HeroScene.svelte`: renders `$gltf.scene` inside a `<T.Group bind:ref={group}>`, with a
  `useTask` callback doing `group.rotation.y += autoRotateSpeed * delta` every frame —
  continuous auto-rotation. Camera is a hardcoded `<T.PerspectiveCamera makeDefault
  position={cameraPosition} fov={cameraFov} />` (a sibling of the group, not affected by
  its rotation).
- An **uncommitted, unstaged** change to this same file replaces that hardcoded camera
  with `{#if $gltf && $gltf.cameras[0]}<T is={$gltf.cameras[0]} makeDefault />{:else}...{/if}`
  — sourcing the camera from the model's embedded `Camera` node (confirmed present via
  `node scripts/inspect-gltf.mjs public/models/hero.glb`, a top-level sibling of the
  hotspot nodes) instead of hand-tuned constants, with a fallback to the existing hardcoded
  values if a future model export omits a camera. This part of the design is validated and
  carries forward into this plan's implementation, but see the Camera section below for
  one thing that must be verified during implementation, not assumed.
- `handleClick` resolves the clicked hotspot via `findHotspotId(event.object)` (walks up
  the parent chain to the nearest ancestor named `hotspot-<id>`) and does
  `window.location.href = hotspot.route` — a full page reload. This bypasses the site's
  `<ClientRouter/>` (`BaseLayout.astro`) entirely; the destination page loads with no
  transition.
- `handlePointerEnter`/`handlePointerLeave` only toggle `document.body.style.cursor`
  between `'pointer'` and `'default'` — no visual change to the hovered object itself.
- `src/lib/three/scene-config.ts` exports `cameraPosition`, `cameraFov`, `autoRotateSpeed`,
  `dracoDecoderPath`.
- `src/lib/three/hotspot-lookup.ts` exports `findHotspotId(object): string | null` — walks
  up and returns the bare id (e.g. `'skills'`), used by both hover and click today. This
  file's usage stays as parent-chain lookup but this plan adds a second, related need (see
  Hover section) — returning the ancestor *object*, not just its id string.
- The design foundation sub-project (already shipped) added a GSAP-based motion system
  (`src/lib/motion/`: `gsap-setup.ts`, `reduced-motion.ts`, `reveal.ts`) and design tokens
  including `$color-accent` (`#8b5cf6`-ish violet) and motion easing/duration tokens
  (`$ease-out-expo`, `$ease-out-quick`, `$duration-reveal`, `$duration-hover`).
- `BaseLayout.astro` already imports `ClientRouter` from `astro:transitions` — Astro's
  client-side navigate function (`navigate`, from `astro:transitions/client`) is available
  to any component on a page using it, which every page does.

## Camera

Remove the auto-rotation mechanism entirely: delete the `useTask` callback that increments
`group.rotation.y`, delete `autoRotateSpeed` from `scene-config.ts`, and remove the `group`
binding/rotation logic from `HeroScene.svelte` (the `<T.Group bind:ref={group}>` wrapper
around `$gltf.scene` can stay as a plain, non-rotating container — Threlte still needs
*some* node to mount `$gltf.scene` under — but the `bind:ref` and `useTask` rotation are
deleted since nothing reads or animates `group` anymore).

Keep the already-drafted camera-sourcing logic (`$gltf.cameras[0]` as a sibling `<T
is={...} makeDefault />`, falling back to the hardcoded `cameraPosition`/`cameraFov`
`<T.PerspectiveCamera>` if the model has no embedded camera) — this remains correct and
desirable independent of the rotation removal (it's still better to source the camera
from what was framed in Blender than to hand-guess numbers).

**One thing to verify during implementation, not assume:** during design discussion, the
user observed the camera itself appeared to be spinning with the currently-uncommitted
draft — before this plan's rotation removal. The working theory is that this was caused by
the *existing* `useTask` rotation (which this plan deletes), not by a failure of the
camera's reparenting-away-from-the-rotating-group logic — but this was never independently
confirmed. Once rotation is removed, there is no remaining code path in the file that
animates any rotation value, so the scene should render as fully static regardless of
the exact mechanics of how Threlte parents an already-parented `is`-provided object.
The implementer must confirm this empirically (visually, in a real browser, over several
seconds) rather than treat it as settled by this reasoning alone.

## Hover — emissive highlight

**New helper, `src/lib/three/hotspot-lookup.ts`:** add
`findHotspotObject(object: Object3D): Object3D | null`, a sibling function to the existing
`findHotspotId` that returns the matched **ancestor object itself** (not its id string) —
same parent-walk logic, different return value. `findHotspotId` stays as-is (still used
for the click → route lookup); the new function is needed because the hover highlight must
affect every mesh in the hotspot's subtree, which requires the actual object to traverse,
not just its name.

**New module, `src/lib/three/hotspot-highlight.ts`:** encapsulates the highlight
mechanics, so `HeroScene.svelte` doesn't hand-roll three.js material mutation inline:

- A one-time preparation step, run once the model is loaded: for every hotspot ancestor
  (the 5 known ids from `hotspots.ts`, resolved via `scene.getObjectByName('hotspot-' +
  id)` or an equivalent traversal), walk its mesh descendants and **clone each mesh's
  material** before storing it back on the mesh. This is required because three.js
  materials are frequently shared across multiple meshes for efficiency — without cloning,
  mutating one hotspot's material on hover could visually affect an unrelated mesh that
  happens to share the same material instance. Store each mesh's original `emissive` color
  and `emissiveIntensity` (or equivalent brightness-related properties, depending on the
  actual material type used by the exported model — verify this against the real
  `hero.glb` during implementation, don't assume `MeshStandardMaterial` without checking)
  alongside the mesh reference, so hover-out can restore exactly what was there before.
- `applyHighlight(hotspotObject: Object3D): void` — sets every descendant mesh's material
  `emissive` to the accent color and nudges brightness up slightly.
- `clearHighlight(hotspotObject: Object3D): void` — restores the stored original values.

The accent color is expressed as a plain hex constant in `scene-config.ts` (three.js
material properties take raw color values, not SCSS variables — there is no build-time
bridge between the two systems), with a comment noting it's intended to visually match
`$color-accent` from `tokens.scss` and should be updated by hand if that token's value
ever changes.

`HeroScene.svelte`'s `handlePointerEnter`/`handlePointerLeave` are updated: resolve the
hotspot object via the new `findHotspotObject`, call `applyHighlight`/`clearHighlight` in
addition to the existing cursor style toggle. If the pointer moves directly from one
hotspot to another without leaving the model entirely, the previous hotspot's highlight
must still be cleared (track the currently-highlighted object and clear it before applying
a new one, rather than relying solely on a single "pointer left the model" event).

## Click — near-black fade, then navigate

Replace `window.location.href = hotspot.route` with a two-step sequence:

1. A full-viewport overlay element (created once, appended to `document.body` — not part
   of the Threlte/Canvas scene graph, this is a 2D DOM/CSS overlay drawn on top of
   everything) fades from transparent to a fully opaque near-black tint (matching
   `$color-bg`) via GSAP, using the same shared `gsap-setup.ts` instance the rest of the
   site's motion uses. **Revised after implementation:** the original design called for a
   translucent accent-violet tint at `$duration-reveal`'s 0.8s — built and shipped that
   way, then changed after trying it in a real browser: the opaque violet flash read as
   jarring, and 0.5s (a deliberate choice for a navigation gate rather than a content
   reveal) felt snappier than the reveal system's 0.8s. The color is now near-black
   (`$color-bg`, `#0a0a0c`) instead of the accent, and the fade is fully opaque
   (`autoAlpha: 1`) rather than translucent, at a 0.5s duration — this reads as a calmer
   cinematic fade-to-black, consistent with how the destination page's own view-transition
   crossfade then takes over from full coverage.
2. Only once that fade's `onComplete` fires does navigation actually happen, via Astro's
   `navigate(hotspot.route)` (imported from `astro:transitions/client`) instead of
   `window.location.href` — this routes through the site's existing `<ClientRouter/>`
   crossfade rather than a raw browser reload/flash.

No reduced-motion gate is needed on this fade specifically: reaching this code path at all
requires the visitor to already have the 3D scene mounted, which itself requires having
passed `shouldUseSimplifiedHero`'s capability check (viewport width, `prefers-reduced-
motion`, `hardwareConcurrency`) — a visitor who prefers reduced motion never gets here in
the first place, they're on the static `.hotspot-links` fallback instead.

The overlay element is scoped to the homepage's DOM. It is not marked `transition:persist`
and needs no manual cleanup — Astro's page swap (triggered by `navigate()`) discards the
entire outgoing page's DOM, overlay included, once the destination page is in place.

## Fallback (unchanged)

The static `.hotspot-links` `<a>` list in `index.astro`, shown to mobile/reduced-motion/
low-power visitors, is untouched by this plan — no fade, no motion, plain instant
navigation via real `<a href>` elements, exactly as already built and reviewed in the
original hero plan.

## File Layout

```
src/lib/three/
  scene-config.ts        # modified — remove autoRotateSpeed, add accent-color hex constant
  hotspot-lookup.ts       # modified — add findHotspotObject alongside existing findHotspotId
  hotspot-highlight.ts    # new — material-clone/highlight/clear-highlight logic
src/components/islands/
  HeroScene.svelte        # modified — remove rotation, wire hover highlight, click fade+navigate
```

No other file changes. `mount-hero-3d.ts`, `Hero3D.svelte`, `index.astro`'s capability-gate
script, and the hotspot data/route mapping are all untouched.

## Explicitly Out of Scope (future work)

- Any change to which routes hotspots map to, or the five hotspot ids themselves.
- The mobile/reduced-motion/low-power fallback UI.
- Any other page's redesign (About/Skills/Projects/Portfolio/Contact — separate
  sub-projects).
- Camera movement/animation on click — explicitly rejected during design discussion in
  favor of the simpler, lower-risk accent-fade screen transition described above.

## Verification

Consistent with this project's established convention — no automated test for 3D
rendering/interaction itself; `findHotspotObject` (pure logic, same shape as the existing
`findHotspotId`) gets Vitest coverage since it's a pure function with no rendering
dependency, matching how `findHotspotId` was already tested in the original hero plan.

Manual verification (kept minimal per the user's explicit guidance that browser-automation
checks are credit-heavy):

- `npm run check` / `npx svelte-check` / `npm run build` passing.
- Load the homepage, confirm the scene is static — camera does not move or rotate over
  several seconds of observation, matching the "standing in the room" intent. This is the
  one check that must be done carefully, not assumed, per the Camera section above.
- Hover each of the five hotspots: cursor becomes a pointer, the hotspot's mesh(es) glow
  with the accent color, and moving directly to a different hotspot clears the previous
  one's glow before applying the new one (no two hotspots highlighted simultaneously).
- Click a hotspot: screen fades to the accent tint, then navigates to the mapped route
  with Astro's crossfade (not a raw page flash/reload) — confirm via the Network tab that
  navigating away from `/` does not produce a full-document reload (no new `document`
  request for the destination HTML outside of Astro's fetch-based transition).
- Confirm the fallback path (resize below the mobile breakpoint, or emulate
  `prefers-reduced-motion: reduce`) is completely unaffected — static links, no fade, no
  3D bundle downloaded, exactly as before this plan.
