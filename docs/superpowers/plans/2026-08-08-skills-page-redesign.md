# Skills Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Skills page's content (new categories matching the revised About bio) and restyle it with the Design Foundation's tokens, shared components, and motion system.

**Architecture:** Two mechanical/additive data-layer changes (new icon imports, new skills content — both keep their existing TypeScript interfaces unchanged) followed by a full rewrite of `skills.astro`'s markup and styles, reusing the shared `HeroTitle`/`SectionIntro` components and a new page-local "chip" list for skill items.

**Tech Stack:** Astro, SCSS (`@use`), `unplugin-icons` (already-configured Iconify icon imports), the site's existing `[data-reveal]` scroll-reveal system (consumed via `HeroTitle`/`SectionIntro`, no direct import needed in `skills.astro`).

## Global Constraints

- Five categories replace the current three in full: **Languages** (TypeScript, JavaScript, Python, Java, PHP, Lua, SQL, HTML, CSS), **Full-Stack Development** (React, Svelte, Astro, Next.js, Node.js, REST APIs, MySQL, MongoDB, Firebase, Three.js, Supabase), **Game Development** (Godot, Game Systems, Gameplay Programming, UI / UX, 3D Asset Integration), **Creative** (Blender, Clip Studio Paint, 3D Modeling, 3D Animation, 2D Illustration, UI Design, Graphic Design), **Tools & Infrastructure** (Git, GitHub, VS Code, Docker, AWS, Adobe Creative Suite).
- Every item gets an icon — real brand icon where one exists, a generic `mdi/*` icon otherwise (no mixed icon/no-icon list). Exact icon keys are specified in Task 1 — use them verbatim, do not substitute alternatives.
- `src/components/ui/icons.ts` changes are purely additive — do not remove or modify any existing import or map entry (several are still consumed by `WorkCard.astro`'s project tech-stack tags, out of scope here).
- `src/data/skills.ts`'s `SkillItem { label, iconKey }` / `SkillGroup { title, items }` interfaces are unchanged — only the `skillGroups` array's content changes.
- Chip style: quiet, not the hero's bold accent-gradient pills — `1px solid $glass-border`, `$glass-fill` background, `$radius-sm` radius, `$color-text` label, icon sized via inherited `font-size` (no explicit icon width/height CSS — matches the established pattern already used for icons elsewhere on this site, e.g. the hero's social-icon links, which size purely through font-size inheritance with no per-icon CSS).
- Page heading uses the shared `HeroTitle` component (`title="Skills"`, `size="h1"`, no `eyebrow`/`supporting` props) — not a hand-rolled `<h1>`.
- Each category heading uses the shared `SectionIntro` component (`title` prop only — no `eyebrow`/`description`).
- No new shared component is extracted for the chip list — it's page-local markup in `skills.astro` (a single consumer doesn't justify extraction, same reasoning as the About redesign's page-local two-column layout).
- Migrate `@import '../styles/tokens'` → `@use '../styles/tokens' as *` (file is being rewritten in full regardless).
- Drop `$gradient-warm` entirely from this file — no replacement decorative underline.
- Formatting: tabs, single quotes, no trailing commas, 100 print width (`.prettierrc`).
- No automated test for this page (established project convention for presentational Astro components).

---

### Task 1: Add new icon imports and replace skills data

**Files:**
- Modify: `src/components/ui/icons.ts` (additive — append new imports and map entries, change nothing existing)
- Modify: `src/data/skills.ts` (full replacement of the `skillGroups` array; interfaces unchanged)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `icons` (`Record<string, any>`, unchanged shape, 19 new keys) and `skillGroups` (`SkillGroup[]`, unchanged shape, new content) — Task 2's page rewrite imports and renders both by their existing names.

This task is data-only and has no visible effect on any rendered page yet (the still-in-place old `skills.astro`/`SkillGroup.astro` keep working against the new data unchanged, since the `SkillItem`/`SkillGroup` interfaces aren't touched) — safe to land and verify independently before Task 2 touches the page itself.

- [ ] **Step 1: Add the 19 new icon imports to `src/components/ui/icons.ts`**

Add these import lines. Place them after the existing `import EmailMdi from 'virtual:icons/mdi/email';` line (the last existing import), before the `icons` export:

```ts
import LuaSimple from 'virtual:icons/simple-icons/lua';
import AstroSimple from 'virtual:icons/simple-icons/astro';
import NextDotJs from 'virtual:icons/simple-icons/nextdotjs';
import ThreeDotJs from 'virtual:icons/simple-icons/threedotjs';
import SupabaseSimple from 'virtual:icons/simple-icons/supabase';
import GodotEngine from 'virtual:icons/simple-icons/godotengine';
import DockerSimple from 'virtual:icons/simple-icons/docker';
import DatabaseMdi from 'virtual:icons/mdi/database';
import ApiMdi from 'virtual:icons/mdi/api';
import GamepadMdi from 'virtual:icons/mdi/gamepad-variant-outline';
import AppBracketsMdi from 'virtual:icons/mdi/application-brackets-outline';
import DashboardMdi from 'virtual:icons/mdi/view-dashboard-outline';
import CubeScanMdi from 'virtual:icons/mdi/cube-scan';
import BrushMdi from 'virtual:icons/mdi/brush-variant';
import CubeOutlineMdi from 'virtual:icons/mdi/cube-outline';
import AnimationPlayMdi from 'virtual:icons/mdi/animation-play-outline';
import PencilMdi from 'virtual:icons/mdi/pencil-outline';
import PaletteSwatchMdi from 'virtual:icons/mdi/palette-swatch';
import PaletteMdi from 'virtual:icons/mdi/palette';
```

- [ ] **Step 2: Add the 19 new map entries**

Inside the `export const icons: Record<string, any> = { ... }` object, add these entries. Place them right before the closing `};` (i.e., after the existing `'mdi/email': EmailMdi` entry — remember to add a trailing comma after that existing line since it's no longer the last entry):

```ts
	'simple-icons/lua': LuaSimple,
	'simple-icons/astro': AstroSimple,
	'simple-icons/nextdotjs': NextDotJs,
	'simple-icons/threedotjs': ThreeDotJs,
	'simple-icons/supabase': SupabaseSimple,
	'simple-icons/godotengine': GodotEngine,
	'simple-icons/docker': DockerSimple,
	'mdi/database': DatabaseMdi,
	'mdi/api': ApiMdi,
	'mdi/gamepad-variant-outline': GamepadMdi,
	'mdi/application-brackets-outline': AppBracketsMdi,
	'mdi/view-dashboard-outline': DashboardMdi,
	'mdi/cube-scan': CubeScanMdi,
	'mdi/brush-variant': BrushMdi,
	'mdi/cube-outline': CubeOutlineMdi,
	'mdi/animation-play-outline': AnimationPlayMdi,
	'mdi/pencil-outline': PencilMdi,
	'mdi/palette-swatch': PaletteSwatchMdi,
	'mdi/palette': PaletteMdi
```

- [ ] **Step 3: Replace `src/data/skills.ts` in full**

```ts
export interface SkillItem {
	label: string;
	iconKey: string;
}

export interface SkillGroup {
	title: string;
	items: SkillItem[];
}

export const skillGroups: SkillGroup[] = [
	{
		title: 'Languages',
		items: [
			{ label: 'TypeScript', iconKey: 'simple-icons/typescript' },
			{ label: 'JavaScript', iconKey: 'simple-icons/javascript' },
			{ label: 'Python', iconKey: 'simple-icons/python' },
			{ label: 'Java', iconKey: 'fa-brands/java' },
			{ label: 'PHP', iconKey: 'simple-icons/php' },
			{ label: 'Lua', iconKey: 'simple-icons/lua' },
			{ label: 'SQL', iconKey: 'mdi/database' },
			{ label: 'HTML', iconKey: 'simple-icons/html5' },
			{ label: 'CSS', iconKey: 'simple-icons/css3' }
		]
	},
	{
		title: 'Full-Stack Development',
		items: [
			{ label: 'React', iconKey: 'simple-icons/react' },
			{ label: 'Svelte', iconKey: 'simple-icons/svelte' },
			{ label: 'Astro', iconKey: 'simple-icons/astro' },
			{ label: 'Next.js', iconKey: 'simple-icons/nextdotjs' },
			{ label: 'Node.js', iconKey: 'simple-icons/nodedotjs' },
			{ label: 'REST APIs', iconKey: 'mdi/api' },
			{ label: 'MySQL', iconKey: 'simple-icons/mysql' },
			{ label: 'MongoDB', iconKey: 'simple-icons/mongodb' },
			{ label: 'Firebase', iconKey: 'simple-icons/firebase' },
			{ label: 'Three.js', iconKey: 'simple-icons/threedotjs' },
			{ label: 'Supabase', iconKey: 'simple-icons/supabase' }
		]
	},
	{
		title: 'Game Development',
		items: [
			{ label: 'Godot', iconKey: 'simple-icons/godotengine' },
			{ label: 'Game Systems', iconKey: 'mdi/gamepad-variant-outline' },
			{ label: 'Gameplay Programming', iconKey: 'mdi/application-brackets-outline' },
			{ label: 'UI / UX', iconKey: 'mdi/view-dashboard-outline' },
			{ label: '3D Asset Integration', iconKey: 'mdi/cube-scan' }
		]
	},
	{
		title: 'Creative',
		items: [
			{ label: 'Blender', iconKey: 'simple-icons/blender' },
			{ label: 'Clip Studio Paint', iconKey: 'mdi/brush-variant' },
			{ label: '3D Modeling', iconKey: 'mdi/cube-outline' },
			{ label: '3D Animation', iconKey: 'mdi/animation-play-outline' },
			{ label: '2D Illustration', iconKey: 'mdi/pencil-outline' },
			{ label: 'UI Design', iconKey: 'mdi/palette-swatch' },
			{ label: 'Graphic Design', iconKey: 'mdi/palette' }
		]
	},
	{
		title: 'Tools & Infrastructure',
		items: [
			{ label: 'Git', iconKey: 'simple-icons/git' },
			{ label: 'GitHub', iconKey: 'simple-icons/github' },
			{ label: 'VS Code', iconKey: 'simple-icons/visualstudiocode' },
			{ label: 'Docker', iconKey: 'simple-icons/docker' },
			{ label: 'AWS', iconKey: 'simple-icons/amazonaws' },
			{ label: 'Adobe Creative Suite', iconKey: 'simple-icons/adobecreativecloud' }
		]
	}
];
```

- [ ] **Step 4: Verify it typechecks and builds**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors. If any `virtual:icons/...` import fails to resolve, double-check the exact icon key spelling against this task's Step 1 — every key listed there was verified to exist in this project's installed `@iconify/json` collections before this plan was written.

- [ ] **Step 5: Verify formatting**

```bash
npx prettier --check src/components/ui/icons.ts src/data/skills.ts
```

Fix with `npx prettier --write` and re-check if needed.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/icons.ts src/data/skills.ts
git commit -m "feat: add new skill icons and replace skills content"
```

---

### Task 2: Rewrite `skills.astro`

**Files:**
- Modify: `src/pages/skills.astro` (full replacement)

**Interfaces:**
- Consumes: `icons` from `../components/ui/icons` (Task 1), `skillGroups` from `../data/skills` (Task 1), `HeroTitle` (`Props { eyebrow?, title, supporting?, size? }`) and `SectionIntro` (`Props { eyebrow?, title, description? }`) from `../components/ui/HeroTitle.astro` / `../components/ui/SectionIntro.astro` (both pre-existing, unmodified).
- Produces: nothing new — this is a leaf page.

- [ ] **Step 1: Replace `src/pages/skills.astro` in full**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroTitle from '../components/ui/HeroTitle.astro';
import SectionIntro from '../components/ui/SectionIntro.astro';
import { icons } from '../components/ui/icons';
import { skillGroups } from '../data/skills';
---

<BaseLayout title="Skills — Jarrett Dominic">
	<section id="skills">
		<HeroTitle title="Skills" size="h1" />
		<div class="skill-groups">
			{
				skillGroups.map((group) => (
					<div class="skill-group">
						<SectionIntro title={group.title} />
						<ul class="skill-chips">
							{group.items.map((item) => {
								const Icon = icons[item.iconKey];
								return (
									<li>
										<Icon />
										<span>{item.label}</span>
									</li>
								);
							})}
						</ul>
					</div>
				))
			}
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@use '../styles/tokens' as *;

	#skills {
		width: 100%;
		max-width: 72rem;
		margin: 0 auto;
		padding: $space-8 $space-5;

		.skill-groups {
			display: flex;
			flex-direction: column;
			gap: $space-8;
			margin-top: $space-6;
		}

		.skill-chips {
			list-style: none;
			display: flex;
			flex-wrap: wrap;
			gap: $space-2;
			margin: 0;
			padding: 0;

			li {
				display: flex;
				align-items: center;
				gap: $space-1;
				padding: $space-1 $space-3;
				border: 1px solid $glass-border;
				border-radius: $radius-sm;
				background: $glass-fill;
				color: $color-text;
				font-family: $font-sans;
				font-size: $font-size-body;
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#skills {
			padding: $space-6 $space-4;
			text-align: center;

			.skill-chips {
				justify-content: center;
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify it typechecks and builds**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run build
```

Expected: no errors.

- [ ] **Step 3: Verify formatting**

```bash
npx prettier --check src/pages/skills.astro
```

Fix with `npx prettier --write src/pages/skills.astro` and re-check if needed.

- [ ] **Step 4: Manual browser check — desktop**

Run `npm run dev`, load `http://localhost:4321/skills`. Expected:
- "Skills" heading at top (no gradient underline).
- Five category sections in order: Languages, Full-Stack Development, Game Development, Creative, Tools & Infrastructure — each with its category name as a heading, followed by a wrapped row of chips (icon + label, thin border, subtle fill — not bold colored pills).
- Every chip shows a real icon (no broken/missing icon boxes) — including the generic-icon items (Game Systems, Gameplay Programming, UI / UX, 3D Asset Integration, Clip Studio Paint, 3D Modeling, 3D Animation, 2D Illustration, UI Design, Graphic Design, REST APIs, SQL).
- The whole page fades/slides in as it scrolls into view (or shortly after load) — not instantly visible with no animation.

- [ ] **Step 5: Manual browser check — mobile and reduced motion**

Resize below 768px (or use device emulation): content stays readable, chips wrap and center. Emulate `prefers-reduced-motion: reduce` and reload: content appears instantly in its final state, no fade/slide — consistent with how every other `[data-reveal]` element on this site already behaves (no page-specific reduced-motion handling needed, `HeroTitle`/`SectionIntro` already gate on it internally).

- [ ] **Step 6: Commit**

```bash
git add src/pages/skills.astro
git commit -m "feat: restyle Skills page with the 2026 design system"
```

---

### Task 3: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Full automated check**

```bash
npm run check
npx svelte-check --tsconfig ./tsconfig.json
npm run test
npm run build
npm run lint
```

Expected: all five pass with no errors.

- [ ] **Step 2: Full manual pass**

Repeat Task 2's Steps 4-5 once more against the final committed state (not mid-development). Additionally: navigate to `/skills` via a client-side link from another page (e.g. click "Skills" in the header) and confirm the reveal animation still plays correctly on a client-side navigation, not just a full page load — then navigate away and back again to confirm it replays correctly each time.

- [ ] **Step 3: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix: address issues found in Skills page redesign final verification pass"
```

(Skip this step if Steps 1-2 passed with no changes needed.)

---

## Self-Review Notes

- **Spec coverage:** New content (all 5 categories, all items) — Task 1 Step 3. Icon strategy (brand where available, generic `mdi/*` otherwise, every item covered) — Task 1 Steps 1-3. Layout (`HeroTitle` heading, `SectionIntro` per category, chip rows) — Task 2 Step 1. Chip style (quiet/hairline, not bold gradient) — Task 2 Step 1 CSS. Responsive (chip wrapping, no breakpoint-specific structural change) — Task 2 Step 1 CSS + Step 5 verification. `icons.ts` additive-only constraint — Task 1 Steps 1-2 (append, don't touch existing lines). No new shared component — Task 2 keeps the chip list page-local. `@import`→`@use` migration and `$gradient-warm` removal — Task 2 Step 1.
- **Type consistency:** `SkillItem`/`SkillGroup` interfaces referenced identically in Task 1 (where they're defined, unchanged) and Task 2 (where `skillGroups` is consumed via `.map()`) — no drift. `icons` record's `Record<string, any>` shape is unchanged; Task 2's `icons[item.iconKey]` lookup pattern matches the exact pattern already used by the pre-existing `SkillGroup.astro`/`WorkCard.astro` components.
- **No placeholders:** both tasks' code blocks are complete, real file content — no "similar to Task N" shortcuts, no omitted icon keys.
