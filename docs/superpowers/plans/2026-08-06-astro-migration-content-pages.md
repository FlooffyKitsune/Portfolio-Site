# Astro Migration & Content Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current single-page SvelteKit site with a multi-page Astro + Svelte-islands site — new file structure, shared design tokens, Content Collections for Projects/Portfolio, and every page (Home, About, Skills, Projects, Portfolio, Contact) working end-to-end with content migrated from the existing site.

**Architecture:** Astro (static output) with `@astrojs/svelte` for islands. Content lives in two places: `src/content/{projects,portfolio}` (Content Collections, Zod-validated) for card-shaped data, and `src/data/skills.ts` (plain typed array) for the skills list. Icons continue to come from `unplugin-icons` (compiler: `svelte`), resolved through one shared registry (`src/components/ui/icons.ts`) so any component can look up an icon by a stable string key instead of hand-managing imports. `src/layouts/BaseLayout.astro` wraps every page with the persistent `Header`/`Footer` and Astro's `ClientRouter` for view transitions. The homepage (`index.astro`) gets a **temporary static hero** in this plan — the follow-up plan (3D Hero & Hotspot Navigation) replaces it with the Threlte scene without touching any other page.

**Tech Stack:** Astro 7, `@astrojs/svelte` 9, Svelte 5, TypeScript, Sass, `unplugin-icons`, Prettier (+ `prettier-plugin-astro`, `prettier-plugin-svelte`).

## Global Constraints

- Output mode is `static` — no server/SSR logic; the site is plain static HTML/CSS/JS served by Vercel.
- No automated test framework exists for this repo and none is introduced in this plan. Verification per task is: `astro check` (typecheck) + `astro build` (build succeeds) + manually loading the page in the dev server and visually confirming it. Content Collection schemas (Zod) are the one form of automated validation — `astro build` fails if frontmatter doesn't match the schema.
- The persistent `Header` nav (About / Skills / Projects / Portfolio / Contact) must render on every page via `BaseLayout.astro` — this is a hard requirement from the approved design, not optional per-page.
- Single dark theme only. All colors/fonts/spacing come from `src/styles/tokens.scss` (SCSS variables) — no hardcoded hex colors or font names in component `<style>` blocks going forward.
- `projects` and `portfolio` Content Collections share one Zod schema (`title`, `description`, `image`, `stack: string[]`, `links: {href, label, iconKey}[]`). `skills` is intentionally a plain data file, not a collection.
- Existing copy (About paragraphs, project/portfolio descriptions, skills list) is migrated verbatim — do not rewrite it. The Contact page is new; keep its copy minimal and functional.
- Static assets move from `static/` to `public/` (Astro's convention) with root-relative paths (`/images/...`, `/pdf/...`) unchanged.
- Formatting: tabs, single quotes, no trailing commas, 100 print width — matches the existing `.prettierrc`; just add the Astro/Svelte plugins to it.

---

### Task 1: Scaffold Astro, remove SvelteKit, verify the dev server boots

**Files:**
- Create: `astro.config.mjs`
- Modify: `package.json` (replace contents)
- Modify: `tsconfig.json` (replace contents)
- Modify: `.gitignore`
- Modify: `.prettierrc`
- Create: `src/env.d.ts`
- Delete: `svelte.config.js`, `vite.config.ts`, `src/app.d.ts`, `src/app.html`, `src/routes/+page.svelte`, `src/lib/index.ts`
- Rename directory: `static/` → `public/`
- Delete (local only, not git-tracked): `.svelte-kit/`

**Interfaces:**
- Produces: the Astro dev/build/preview toolchain every later task runs against (`npm run dev`, `npm run build`, `npm run check`). No app code depends on this task besides tooling.

- [ ] **Step 1: Delete SvelteKit-only files**

```bash
rm svelte.config.js vite.config.ts src/app.d.ts src/app.html
rm -rf src/routes src/lib
rm -rf .svelte-kit
```

- [ ] **Step 2: Rename `static/` to `public/`**

```bash
git mv static public
```

- [ ] **Step 3: Replace `package.json`**

```json
{
	"name": "portfolio",
	"version": "0.0.1",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "astro dev",
		"build": "astro build",
		"preview": "astro preview",
		"check": "astro check",
		"lint": "prettier --check .",
		"format": "prettier --write ."
	},
	"devDependencies": {
		"@astrojs/svelte": "^9.0.0",
		"@iconify/json": "^2.2.164",
		"astro": "^7.0.0",
		"prettier": "^3.1.1",
		"prettier-plugin-astro": "^0.14.0",
		"prettier-plugin-svelte": "^3.1.2",
		"sass": "^1.69.7",
		"svelte": "^5.0.0",
		"svelte-check": "^4.0.0",
		"typescript": "^5.0.0",
		"unplugin-icons": "^0.18.1"
	}
}
```

- [ ] **Step 4: Replace `tsconfig.json`**

```json
{
	"extends": "astro/tsconfigs/strict",
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"]
		}
	},
	"include": [".astro/types.d.ts", "**/*"],
	"exclude": ["dist"]
}
```

- [ ] **Step 5: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	integrations: [svelte()],
	vite: {
		plugins: [Icons({ compiler: 'svelte' })]
	}
});
```

- [ ] **Step 6: Create `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 7: Update `.gitignore`**

Replace `/build` and `/.svelte-kit` with:

```
/dist
/.astro
```

- [ ] **Step 8: Add Astro/Svelte plugins to `.prettierrc`**

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-astro", "prettier-plugin-svelte"],
	"overrides": [
		{ "files": "*.svelte", "options": { "parser": "svelte" } },
		{ "files": "*.astro", "options": { "parser": "astro" } }
	]
}
```

- [ ] **Step 9: Install dependencies**

```bash
npm install
```

- [ ] **Step 10: Verify the dev server boots**

```bash
npm run dev
```

Expected: server starts on `localhost:4321` with no errors (a blank/404-ish page is fine — there's no `src/pages/index.astro` yet). Stop the server after confirming.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro, remove SvelteKit"
```

---

### Task 2: Design tokens & global stylesheet

**Files:**
- Create: `src/styles/tokens.scss`
- Create: `src/styles/global.scss`

**Interfaces:**
- Consumes: nothing.
- Produces: SCSS variables (`$color-bg`, `$color-surface`, `$color-text`, `$color-accent-purple`, `$color-accent-purple-dark`, `$gradient-purple`, `$gradient-warm`, `$font-heading`, `$font-heading-serif`, `$font-body`, `$breakpoint-mobile`) — every later component `<style>` block imports this file and uses these names instead of hardcoded values.

- [ ] **Step 1: Create `src/styles/tokens.scss`**

```scss
// Design tokens — single source of truth for color, type, spacing.
// Dark theme only for now; migrate to CSS custom properties if light mode is added later.

$color-bg: #1f1f1f;
$color-surface: #2c2f33;
$color-text: #fff;
$color-accent-purple: #b288c0;
$color-accent-purple-dark: #63458a;

$gradient-purple: linear-gradient(to right top, #e4b7e5, #c498cd, #a47bb6, #845fa0, #63458a);
$gradient-warm: linear-gradient(to right top, #ff6f91, #ff807d, #ff966d, #ffae61, #ffc75f);

$font-heading: 'Ubuntu', sans-serif;
$font-heading-serif: 'Inknut Antiqua', serif;
$font-body: 'Unna', serif;

$breakpoint-mobile: 768px;
```

- [ ] **Step 2: Create `src/styles/global.scss`**

```scss
@import './tokens';

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	background-color: $color-bg;
	color: $color-text;
	font-family: $font-body;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles
git commit -m "feat: add design tokens and global stylesheet"
```

---

### Task 3: BaseLayout, Header, Footer, console logo

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ui/Header.astro`
- Create: `src/components/ui/Footer.astro`
- Create: `src/lib/console-logo.ts`

**Interfaces:**
- Consumes: `src/styles/tokens.scss`, `src/styles/global.scss` (Task 2).
- Produces: `BaseLayout` component with `Props { title: string }`, rendering `<slot />` between a persistent `Header` and `Footer`. Every page task from here on wraps its content in `<BaseLayout title="...">`.

- [ ] **Step 1: Create `src/lib/console-logo.ts`** (ported from the old `src/utils/logo.ts` easter egg)

```ts
export const consoleLogo = `%c
 _    __      __      _           _____ __            ___     
| |  / /_  __/ /___  (_)___  ___ / ___// /___  ______/ (_)___ 
| | / / / / / / __ \\/ / __ \\/ _ \\\\__ \\/ __/ / / / __  / / __ \\
| |/ / /_/ / / /_/ / / / / /  __/__/ / /_/ /_/ / /_/ / / /_/ /
|___/\\__,_/_/ .___/_/_/ /_/\\___/____/\\__/\\__,_/\\__,_/_/\\____/ 
           /_/                                                
                                        Developed by: Jarrett Dominic
 -------------------------------------------------------------------- 
`;

export const consoleLogoStyle = 'color: purple;';
```

- [ ] **Step 2: Create `src/components/ui/Header.astro`**

```astro
---
const navItems = [
	{ href: '/about', label: 'About' },
	{ href: '/skills', label: 'Skills' },
	{ href: '/projects', label: 'Projects' },
	{ href: '/portfolio', label: 'Portfolio' },
	{ href: '/contact', label: 'Contact' }
];
---

<header>
	<a href="/"><img src="/images/svg/logo.svg?v=1" alt="Logo" /></a>
	<nav>
		<ul>
			{navItems.map((item) => (
				<li><a href={item.href}>{item.label}</a></li>
			))}
		</ul>
	</nav>
</header>

<style lang="scss">
	@import '../../styles/tokens';

	header {
		display: flex;
		flex-direction: row;
		background-color: #23272a;
		box-shadow: #00000059 0 5px 15px;
		width: 100%;
		align-items: center;

		a {
			display: flex;
		}

		img {
			width: 5rem;
			padding-top: 1rem;
			margin-left: 2.5rem;
		}

		nav {
			min-height: 10vh;
			margin: auto;
			width: 90%;
			display: flex;
			align-items: center;
			justify-content: space-between;

			ul {
				width: 100%;
				list-style: none;
				display: flex;
				justify-content: flex-end;
				align-items: center;

				li {
					padding: 0 1rem;
					font-size: 1.2rem;
					font-weight: 500;
					font-family: $font-heading;
					letter-spacing: 0.1rem;
					text-transform: uppercase;

					a {
						text-decoration: none;
						color: $color-accent-purple;
						transition: color 0.3s ease;

						&:hover {
							color: $color-accent-purple-dark;
						}
					}
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		header {
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 1rem 0;

			img {
				margin: 0;
			}

			nav {
				min-height: auto;
				width: 100%;
				margin-top: 0.5rem;

				ul {
					flex-wrap: wrap;
					justify-content: center;

					li {
						padding: 0.5rem;
						font-size: 1rem;
					}
				}
			}
		}
	}
</style>
```

Note: the original site hid `nav` entirely below 768px (`display: none`). That contradicts the "persistent, accessible nav on every page" requirement from the design spec, so this version wraps the nav items onto a second row on mobile instead of hiding them.

- [ ] **Step 3: Create `src/components/ui/Footer.astro`**

```astro
---
const year = new Date().getFullYear();
---

<footer>
	<p>© {year} Jarrett Dominic</p>
</footer>

<style lang="scss">
	@import '../../styles/tokens';

	footer {
		width: 100%;
		height: 6rem;
		background: $color-bg;
		display: flex;
		justify-content: center;
		align-items: center;
		color: $color-text;
		font-family: $font-heading;
		font-size: 1.2rem;
	}
</style>
```

- [ ] **Step 4: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Header from '../components/ui/Header.astro';
import Footer from '../components/ui/Footer.astro';
import { ClientRouter } from 'astro:transitions';
import '../styles/global.scss';

interface Props {
	title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="en" style="scroll-behavior: smooth;">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link
			href="https://fonts.googleapis.com/css2?family=Ubuntu&family=Unna&family=Inknut+Antiqua:wght@500;700&display=swap"
			rel="stylesheet"
		/>
		<title>{title}</title>
		<ClientRouter />
	</head>
	<body>
		<Header />
		<slot />
		<Footer />
		<script>
			import { consoleLogo, consoleLogoStyle } from '../lib/console-logo';
			console.log(consoleLogo, consoleLogoStyle);
		</script>
	</body>
</html>
```

- [ ] **Step 5: Verify it typechecks**

```bash
npm run check
```

Expected: no errors (there's still no page using `BaseLayout` yet, but it must compile standalone).

- [ ] **Step 6: Commit**

```bash
git add src/layouts src/components/ui/Header.astro src/components/ui/Footer.astro src/lib/console-logo.ts
git commit -m "feat: add BaseLayout, Header, Footer"
```

---

### Task 4: Icon registry & shared WorkCard component

**Files:**
- Create: `src/components/ui/icons.ts`
- Create: `src/components/ui/WorkCard.astro`

**Interfaces:**
- Consumes: `src/styles/tokens.scss` (Task 2).
- Produces: `icons: Record<string, any>` keyed by `"<iconify-collection>/<icon-name>"` (e.g. `'simple-icons/github'`), and a `WorkCard` component with
  `Props { title: string; description: string; image: string; stack: string[]; links: { href: string; label: string; iconKey: string }[] }`.
  Tasks 5–9 (Projects, Portfolio, Skills, About, Home, Contact) all import `icons` from this file; Tasks 5–6 (Projects, Portfolio pages) render `WorkCard`.

- [ ] **Step 1: Create `src/components/ui/icons.ts`**

```ts
import Html5 from 'virtual:icons/simple-icons/html5';
import Css3 from 'virtual:icons/simple-icons/css3';
import SassSimple from 'virtual:icons/simple-icons/sass';
import JavascriptSimple from 'virtual:icons/simple-icons/javascript';
import TypescriptSimple from 'virtual:icons/simple-icons/typescript';
import SvelteSimple from 'virtual:icons/simple-icons/svelte';
import ReactSimple from 'virtual:icons/simple-icons/react';
import Redux from 'virtual:icons/simple-icons/redux';
import NodeDotJs from 'virtual:icons/simple-icons/nodedotjs';
import Python from 'virtual:icons/simple-icons/python';
import Php from 'virtual:icons/simple-icons/php';
import Java from 'virtual:icons/fa-brands/java';
import MySql from 'virtual:icons/simple-icons/mysql';
import MongoDb from 'virtual:icons/simple-icons/mongodb';
import Firebase from 'virtual:icons/simple-icons/firebase';
import Git from 'virtual:icons/simple-icons/git';
import GithubSimple from 'virtual:icons/simple-icons/github';
import VsCode from 'virtual:icons/simple-icons/visualstudiocode';
import AdobeCreativeCloud from 'virtual:icons/simple-icons/adobecreativecloud';
import BlenderSimple from 'virtual:icons/simple-icons/blender';
import AmazonAws from 'virtual:icons/simple-icons/amazonaws';
import Npm from 'virtual:icons/simple-icons/npm';
import Yarn from 'virtual:icons/simple-icons/yarn';
import Netlify from 'virtual:icons/simple-icons/netlify';
import Autodesk from 'virtual:icons/simple-icons/autodesk';
import SvelteLogo from 'virtual:icons/logos/svelte-icon';
import ViteLogo from 'virtual:icons/logos/vitejs';
import TypescriptLogo from 'virtual:icons/logos/typescript-icon';
import SassLogo from 'virtual:icons/logos/sass';
import VercelLogo from 'virtual:icons/logos/vercel-icon';
import BlenderLogo from 'virtual:icons/logos/blender';
import SemanticUiLogo from 'virtual:icons/logos/semantic-ui';
import YoutubeLogo from 'virtual:icons/logos/youtube-icon';
import ReactVscode from 'virtual:icons/vscode-icons/file-type-reactjs';
import JsVscode from 'virtual:icons/vscode-icons/file-type-js-official';
import HtmlVscode from 'virtual:icons/vscode-icons/file-type-html';
import CssVscode from 'virtual:icons/vscode-icons/file-type-css';
import DocLine from 'virtual:icons/simple-line-icons/doc';
import DocumentSolid from 'virtual:icons/basil/document-solid';
import GithubMdi from 'virtual:icons/mdi/github';
import LinkedinMdi from 'virtual:icons/mdi/linkedin';
import EmailMdi from 'virtual:icons/mdi/email';

// unplugin-icons compiles each import to a Svelte component; `any` avoids
// fighting the generated component types just to store them in a lookup map.
export const icons: Record<string, any> = {
	'simple-icons/html5': Html5,
	'simple-icons/css3': Css3,
	'simple-icons/sass': SassSimple,
	'simple-icons/javascript': JavascriptSimple,
	'simple-icons/typescript': TypescriptSimple,
	'simple-icons/svelte': SvelteSimple,
	'simple-icons/react': ReactSimple,
	'simple-icons/redux': Redux,
	'simple-icons/nodedotjs': NodeDotJs,
	'simple-icons/python': Python,
	'simple-icons/php': Php,
	'fa-brands/java': Java,
	'simple-icons/mysql': MySql,
	'simple-icons/mongodb': MongoDb,
	'simple-icons/firebase': Firebase,
	'simple-icons/git': Git,
	'simple-icons/github': GithubSimple,
	'simple-icons/visualstudiocode': VsCode,
	'simple-icons/adobecreativecloud': AdobeCreativeCloud,
	'simple-icons/blender': BlenderSimple,
	'simple-icons/amazonaws': AmazonAws,
	'simple-icons/npm': Npm,
	'simple-icons/yarn': Yarn,
	'simple-icons/netlify': Netlify,
	'simple-icons/autodesk': Autodesk,
	'logos/svelte-icon': SvelteLogo,
	'logos/vitejs': ViteLogo,
	'logos/typescript-icon': TypescriptLogo,
	'logos/sass': SassLogo,
	'logos/vercel-icon': VercelLogo,
	'logos/blender': BlenderLogo,
	'logos/semantic-ui': SemanticUiLogo,
	'logos/youtube-icon': YoutubeLogo,
	'vscode-icons/file-type-reactjs': ReactVscode,
	'vscode-icons/file-type-js-official': JsVscode,
	'vscode-icons/file-type-html': HtmlVscode,
	'vscode-icons/file-type-css': CssVscode,
	'simple-line-icons/doc': DocLine,
	'basil/document-solid': DocumentSolid,
	'mdi/github': GithubMdi,
	'mdi/linkedin': LinkedinMdi,
	'mdi/email': EmailMdi
};
```

Note: some icons intentionally have two entries for the same technology from different Iconify sets (e.g. `simple-icons/svelte` vs `logos/svelte-icon`, `simple-icons/blender` vs `logos/blender`) — this matches which icon set the original `Skills.svelte` vs `Projects.svelte` used, so visuals don't change in this migration. Reconciling that inconsistency is a visual-polish decision for later, not this pass.

- [ ] **Step 2: Create `src/components/ui/WorkCard.astro`**

```astro
---
import { icons } from './icons';

interface Props {
	title: string;
	description: string;
	image: string;
	stack: string[];
	links: { href: string; label: string; iconKey: string }[];
}

const { title, description, image, stack, links } = Astro.props;
---

<div class="work-card">
	<img src={image} alt={`${title} preview`} />
	<div class="work-content">
		<div class="work-header">
			<h3>{title}</h3>
			<div class="work-stack">
				{stack.map((key) => {
					const Icon = icons[key];
					return (
						<span>
							<Icon />
						</span>
					);
				})}
			</div>
		</div>
		<p>{description}</p>
		<div class="work-links">
			{links.map((link) => {
				const Icon = icons[link.iconKey];
				return (
					<a href={link.href} target="_blank" rel="noopener noreferrer">
						<Icon /><span>{link.label}</span>
					</a>
				);
			})}
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.work-card {
		display: flex;
		flex-direction: row;
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 4px 21px -12px rgba(0, 0, 0, 0.66);
		margin: 1rem 0;

		img {
			width: 35%;
			height: 100%;
			object-fit: cover;
		}

		.work-content {
			width: 65%;
			display: flex;
			flex-direction: column;
			background-color: $color-surface;

			.work-header {
				display: flex;
				flex-direction: row;
				align-items: end;
				justify-content: space-between;
				padding: 1rem 2rem 0.25rem 1rem;

				h3 {
					font-family: $font-heading;
					color: $color-text;
					font-size: 2.5rem;
				}

				.work-stack {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					padding-left: 1rem;

					span {
						display: flex;
						align-items: center;
						font-size: 2rem;
						padding: 0.2rem;
					}
				}
			}

			p {
				font-family: $font-body;
				color: $color-text;
				font-size: 1.5rem;
				padding: 1rem;
			}

			.work-links {
				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				padding: 1rem;

				a {
					display: flex;
					flex-direction: row;
					align-items: center;
					margin: 0 1rem;
					padding: 0.5rem 1rem;
					text-decoration: none;
					color: $color-text;
					font-size: 1.5rem;
					font-family: $font-body;
					background: $gradient-purple;
					border-radius: 20px;

					span {
						padding-left: 0.5rem;
					}
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		.work-card {
			flex-direction: column;
			margin: 3rem 0 0;

			img {
				width: 100%;
			}

			.work-content {
				width: 100%;
				padding: 2.5rem 0 0;
				text-align: center;

				.work-header {
					flex-direction: column;
					align-items: center;
					padding: 0;

					h3 {
						padding: 1rem 1.5rem;
					}

					.work-stack {
						padding: 0;
					}
				}

				p {
					padding: 1rem 1.5rem;
					text-align: left;
				}

				.work-links {
					padding: 0;
					margin: 1rem 0 2.5rem;
					justify-content: center;
				}
			}
		}
	}
</style>
```

- [ ] **Step 3: Verify it typechecks**

```bash
npm run check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/icons.ts src/components/ui/WorkCard.astro
git commit -m "feat: add icon registry and shared WorkCard component"
```

---

### Task 5: Projects content collection & page

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/projects/portfolio-site.md`
- Create: `src/content/projects/yt-app.md`
- Create: `src/content/projects/h2g2.md`
- Create: `src/pages/projects.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 3), `WorkCard` + `icons` (Task 4).
- Produces: the `projects` and `portfolio` collection schema (`workEntry`) in `content/config.ts` — Task 6 (Portfolio page) reuses the same `portfolio` collection defined here.

- [ ] **Step 1: Create `src/content/config.ts`**

```ts
import { defineCollection, z } from 'astro:content';

const workEntry = z.object({
	title: z.string(),
	description: z.string(),
	image: z.string(),
	stack: z.array(z.string()),
	links: z.array(
		z.object({
			href: z.string(),
			label: z.string(),
			iconKey: z.string()
		})
	)
});

const projects = defineCollection({ type: 'content', schema: workEntry });
const portfolio = defineCollection({ type: 'content', schema: workEntry });

export const collections = { projects, portfolio };
```

- [ ] **Step 2: Create `src/content/projects/portfolio-site.md`**

```md
---
title: 'Portfolio'
description: "A constantly evolving showcase of projects I've worked on. My portfolio is a more professional representation of my work and skills. The site is built on Svelte with SASS and Typescript and is hosted through Vercel. All graphical assets are made by me utilizing Photoshop, Illustrator and Blender."
image: '/images/projects/portfolio.png'
stack:
  - 'logos/svelte-icon'
  - 'logos/vitejs'
  - 'logos/typescript-icon'
  - 'logos/sass'
  - 'logos/vercel-icon'
links:
  - href: 'https://github.com/FlooffyKitsune/Portfolio-Site'
    label: 'GitHub'
    iconKey: 'simple-icons/github'
---
```

- [ ] **Step 3: Create `src/content/projects/yt-app.md`**

```md
---
title: 'YT-App'
description: "A basic React base site that utilizes Google's API to allow the user to search YouTube videos through a search bar. A main video is displayed with its title and description and five suggested videos and their titles are shown as well. SemanticUI was utilized for quick formatting of the site content."
image: '/images/projects/tube.png'
stack:
  - 'vscode-icons/file-type-reactjs'
  - 'vscode-icons/file-type-js-official'
  - 'logos/semantic-ui'
  - 'logos/youtube-icon'
links:
  - href: 'https://github.com/FlooffyKitsune/yt-app'
    label: 'GitHub'
    iconKey: 'simple-icons/github'
  - href: 'https://waffletube.netlify.app/'
    label: 'Demo'
    iconKey: 'simple-icons/netlify'
---
```

- [ ] **Step 4: Create `src/content/projects/h2g2.md`**

```md
---
title: 'H2G2'
description: 'A basic site built with vanilla HTML, CSS, and JavaScript. This site was built for a class with the intent of creating a simple and efficient site about a book. JavaScript was minimally used to add some simple animations to the site.'
image: '/images/projects/h2g2.png'
stack:
  - 'vscode-icons/file-type-html'
  - 'vscode-icons/file-type-css'
  - 'vscode-icons/file-type-js-official'
links:
  - href: 'https://github.com/FlooffyKitsune/h2g2'
    label: 'GitHub'
    iconKey: 'simple-icons/github'
  - href: 'https://h2g2.netlify.app/'
    label: 'Demo'
    iconKey: 'simple-icons/netlify'
---
```

- [ ] **Step 5: Create `src/pages/projects.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import WorkCard from '../components/ui/WorkCard.astro';
import { getCollection } from 'astro:content';

const entries = await getCollection('projects');
---

<BaseLayout title="Projects — Jarrett Dominic">
	<section id="projects">
		<h2>Projects</h2>
		<div class="work-wrapper">
			{
				entries.map((entry) => (
					<WorkCard
						title={entry.data.title}
						description={entry.data.description}
						image={entry.data.image}
						stack={entry.data.stack}
						links={entry.data.links}
					/>
				))
			}
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	#projects {
		width: 100%;
		padding: 8rem 13% 5rem;

		h2 {
			font-family: $font-heading;
			font-size: 2.5rem;
			margin-bottom: 1rem;
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;

			&::after {
				content: '';
				display: block;
				height: 2px;
				background: $gradient-warm no-repeat;
			}
		}

		.work-wrapper {
			display: flex;
			flex-direction: column;
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#projects {
			padding: 6rem 0 0;

			h2 {
				text-align: center;
			}
		}
	}
</style>
```

- [ ] **Step 6: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/projects` — expected: three project cards (Portfolio, YT-App, H2G2) with correct images, stack icons, description text, and working GitHub/Demo links.

- [ ] **Step 7: Commit**

```bash
git add src/content src/pages/projects.astro
git commit -m "feat: add projects content collection and page"
```

---

### Task 6: Portfolio (art/design) content collection & page

**Files:**
- Create: `src/content/portfolio/35-below.md`
- Create: `src/content/portfolio/caffeine.md`
- Create: `src/content/portfolio/misc-work.md`
- Create: `src/pages/portfolio.astro`

**Interfaces:**
- Consumes: `portfolio` collection schema (Task 5's `content/config.ts`), `BaseLayout`, `WorkCard`.

- [ ] **Step 1: Create `src/content/portfolio/35-below.md`**

```md
---
title: '35 Below'
description: "Consulting services were provided to 35 Below in regards to a potential overhaul for their brand's website. The design was made in Adobe XD with some minor edits to photos in Photoshop. The intent was to keep their site light-weight, but modernize it and introduce design standards."
image: '/images/projects/35below.png'
stack:
  - 'simple-icons/adobecreativecloud'
links:
  - href: '/images/35BelowBA.webp'
    label: 'Before / After'
    iconKey: 'simple-line-icons/doc'
---
```

- [ ] **Step 2: Create `src/content/portfolio/caffeine.md`**

```md
---
title: 'Caffeine'
description: "I was commissioned to redo all of the store's signs, menus, and logos. All work was done in Adobe Illustrator and organized files were provided to Caffeine for easy adjustments and future updates to content."
image: '/images/projects/caffeine.png'
stack:
  - 'simple-icons/adobecreativecloud'
links:
  - href: '/pdf/CaffeineWinter.pdf'
    label: 'Example'
    iconKey: 'simple-line-icons/doc'
---
```

- [ ] **Step 3: Create `src/content/portfolio/misc-work.md`**

```md
---
title: 'Miscellaneous Work'
description: 'A collection of some different works commissioned from me (only works I was given permission to share are shown).'
image: '/images/projects/kl.png'
stack:
  - 'simple-icons/adobecreativecloud'
  - 'logos/blender'
  - 'simple-icons/autodesk'
links:
  - href: 'https://drive.google.com/drive/folders/1RKatprwsS5pnc0vga4XUGhLyEr7ZEZn2?usp=sharing'
    label: 'View'
    iconKey: 'simple-line-icons/doc'
---
```

- [ ] **Step 4: Create `src/pages/portfolio.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import WorkCard from '../components/ui/WorkCard.astro';
import { getCollection } from 'astro:content';

const entries = await getCollection('portfolio');
---

<BaseLayout title="Portfolio — Jarrett Dominic">
	<section id="portfolio-work">
		<h2>Portfolio</h2>
		<div class="work-wrapper">
			{
				entries.map((entry) => (
					<WorkCard
						title={entry.data.title}
						description={entry.data.description}
						image={entry.data.image}
						stack={entry.data.stack}
						links={entry.data.links}
					/>
				))
			}
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	#portfolio-work {
		width: 100%;
		padding: 8rem 13% 5rem;

		h2 {
			font-family: $font-heading;
			font-size: 2.5rem;
			margin-bottom: 1rem;
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;

			&::after {
				content: '';
				display: block;
				height: 2px;
				background: $gradient-warm no-repeat;
			}
		}

		.work-wrapper {
			display: flex;
			flex-direction: column;
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#portfolio-work {
			padding: 6rem 0 0;

			h2 {
				text-align: center;
			}
		}
	}
</style>
```

- [ ] **Step 5: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/portfolio` — expected: three cards (35 Below, Caffeine, Miscellaneous Work) with correct images/icons/links.

- [ ] **Step 6: Commit**

```bash
git add src/content/portfolio src/pages/portfolio.astro
git commit -m "feat: add portfolio (art/design) content collection and page"
```

---

### Task 7: Skills data & page

**Files:**
- Create: `src/data/skills.ts`
- Create: `src/components/ui/SkillGroup.astro`
- Create: `src/pages/skills.astro`

**Interfaces:**
- Consumes: `icons` (Task 4), `BaseLayout` (Task 3).
- Produces: `skillGroups: SkillGroup[]` where `SkillGroup = { title: string; items: { label: string; iconKey: string }[] }`.

- [ ] **Step 1: Create `src/data/skills.ts`**

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
		title: 'Front-end',
		items: [
			{ label: 'HTML', iconKey: 'simple-icons/html5' },
			{ label: 'CSS', iconKey: 'simple-icons/css3' },
			{ label: 'SASS', iconKey: 'simple-icons/sass' },
			{ label: 'JavaScript', iconKey: 'simple-icons/javascript' },
			{ label: 'TypeScript', iconKey: 'simple-icons/typescript' },
			{ label: 'Svelte', iconKey: 'simple-icons/svelte' },
			{ label: 'React', iconKey: 'simple-icons/react' },
			{ label: 'Redux', iconKey: 'simple-icons/redux' }
		]
	},
	{
		title: 'Back-end',
		items: [
			{ label: 'Node.js', iconKey: 'simple-icons/nodedotjs' },
			{ label: 'Python', iconKey: 'simple-icons/python' },
			{ label: 'PHP', iconKey: 'simple-icons/php' },
			{ label: 'Java', iconKey: 'fa-brands/java' },
			{ label: 'MySQL', iconKey: 'simple-icons/mysql' },
			{ label: 'MongoDB', iconKey: 'simple-icons/mongodb' },
			{ label: 'Firebase', iconKey: 'simple-icons/firebase' }
		]
	},
	{
		title: 'Tools',
		items: [
			{ label: 'Git', iconKey: 'simple-icons/git' },
			{ label: 'GitHub', iconKey: 'simple-icons/github' },
			{ label: 'VS Code', iconKey: 'simple-icons/visualstudiocode' },
			{ label: 'Adobe Suite', iconKey: 'simple-icons/adobecreativecloud' },
			{ label: 'Blender', iconKey: 'simple-icons/blender' },
			{ label: 'AWS', iconKey: 'simple-icons/amazonaws' },
			{ label: 'NPM', iconKey: 'simple-icons/npm' },
			{ label: 'Yarn', iconKey: 'simple-icons/yarn' }
		]
	}
];
```

- [ ] **Step 2: Create `src/components/ui/SkillGroup.astro`**

```astro
---
import { icons } from './icons';
import type { SkillItem } from '../../data/skills';

interface Props {
	title: string;
	items: SkillItem[];
}

const { title, items } = Astro.props;
---

<div class="skills-card">
	<h3>{title}</h3>
	<ul>
		{
			items.map((item) => {
				const Icon = icons[item.iconKey];
				return (
					<li>
						{item.label}
						<Icon />
					</li>
				);
			})
		}
	</ul>
</div>

<style lang="scss">
	@import '../../styles/tokens';

	.skills-card {
		flex-grow: 1;
		flex-basis: 0;
		display: flex;
		flex-direction: column;
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 4px 21px -12px rgba(0, 0, 0, 0.66);
		margin: 0.5rem;
		background-color: $color-surface;
		color: $color-text;

		h3 {
			font-family: $font-heading;
			font-size: 2rem;
			padding: 1rem;
			text-align: center;
			background-image: $gradient-warm;
		}

		ul {
			list-style: none;
			padding: 1rem;
			font-size: 1.25rem;
			font-family: $font-body;
			text-align: left;

			li {
				padding: 0.5rem;
				font-size: 1.5rem;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		.skills-card {
			width: 100%;
			margin: 1.5rem 0 0;
		}
	}
</style>
```

- [ ] **Step 3: Create `src/pages/skills.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SkillGroup from '../components/ui/SkillGroup.astro';
import { skillGroups } from '../data/skills';
---

<BaseLayout title="Skills — Jarrett Dominic">
	<section id="skills">
		<h2>Skills</h2>
		<div class="skills-wrapper">
			{skillGroups.map((group) => <SkillGroup title={group.title} items={group.items} />)}
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	#skills {
		width: 100%;
		padding: 8rem 13% 5rem;

		h2 {
			font-family: $font-heading;
			font-size: 2.5rem;
			margin-bottom: 1rem;
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;

			&::after {
				content: '';
				display: block;
				height: 2px;
				background: $gradient-warm no-repeat;
			}
		}

		.skills-wrapper {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#skills {
			padding: 6rem 0 0;

			h2 {
				text-align: center;
			}

			.skills-wrapper {
				display: inline;
			}
		}
	}
</style>
```

- [ ] **Step 4: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/skills` — expected: three cards (Front-end, Back-end, Tools) each listing the correct items with icons.

- [ ] **Step 5: Commit**

```bash
git add src/data/skills.ts src/components/ui/SkillGroup.astro src/pages/skills.astro
git commit -m "feat: add skills data and page"
```

---

### Task 8: About page

**Files:**
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `icons` (Task 4), `BaseLayout` (Task 3).

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';

const DocumentIcon = icons['basil/document-solid'];
---

<BaseLayout title="About — Jarrett Dominic">
	<section id="about">
		<div class="about-wrapper">
			<img src="/images/jarrett.png" alt="Jarrett Dominic" />
			<div class="about-content">
				<h2>About Me</h2>
				<p>
					I'm a versatile developer with a primary focus on front-end development. In addition
					to my expertise in crafting user-friendly interfaces, I bring valuable experience in
					backend development and graphic design to the table. My coding journey is fueled by a
					genuine passion for creating digital experiences that seamlessly blend aesthetics and
					functionality. From developing interactive web applications to designing captivating
					user interfaces, I thrive on turning ideas into reality.
				</p>
				<p>
					Beyond the screen, I enjoy working on DIY projects and building things from scratch, as
					well as working with virtual reality. When not immersed in the digital world, you can
					find me pursuing outdoor adventures whether it be mountain biking or rock climbing.
				</p>
			</div>
		</div>
		<div class="resume-button">
			<a href="/pdf/JarrettDominicResume.pdf" target="_blank" rel="noopener noreferrer">
				<span>Download CV</span><DocumentIcon />
			</a>
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	#about {
		width: 100%;
		padding: 8rem 0 10rem;
		background-color: $color-bg;

		.about-wrapper {
			width: 100%;
			height: 27rem;
			display: flex;
			justify-content: center;
			align-items: center;

			img {
				width: 20rem;
				height: 20rem;
				border-radius: 50px;
			}

			.about-content {
				width: 50%;
				height: 20rem;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-start;
				padding: 0 2rem;
				color: $color-text;

				h2 {
					font-family: $font-heading;
					font-size: 2.5rem;
					margin-bottom: 1rem;
					background-image: $gradient-warm;
					-webkit-text-fill-color: transparent;
					-webkit-background-clip: text;

					&::after {
						content: '';
						display: block;
						height: 2px;
						background: $gradient-warm no-repeat;
					}
				}

				p {
					font-family: $font-body;
					font-size: 1.2rem;
					text-align: left;
					margin-bottom: 1rem;
				}
			}
		}

		.resume-button {
			width: 15rem;
			height: 3.5rem;
			display: flex;
			justify-content: center;
			align-items: center;
			background-image: linear-gradient(to right, #fff, #fff);
			margin: -3rem auto 0;
			border-radius: 15px;

			a {
				text-decoration: none;
				color: $color-bg;
				font-family: $font-heading;
				font-size: 1.2rem;
				font-weight: 700;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 0 2rem;
				height: 100%;
				width: 100%;

				span {
					padding-right: 1rem;
				}
			}

			&:hover {
				background-image: $gradient-warm;

				a {
					color: $color-text;
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#about {
			.about-wrapper {
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 100%;
				padding: 2rem 0 1rem;

				img {
					margin: 0;
				}

				.about-content {
					width: 100%;
					height: 100%;
					padding: 0;
					margin-top: 2rem;
					text-align: center;

					p {
						padding: 1rem 1.5rem;
					}
				}
			}

			.resume-button {
				margin: 2rem auto 0;
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/about` — expected: photo, both paragraphs, and a working "Download CV" link opening the PDF.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add about page"
```

---

### Task 9: Contact page

**Files:**
- Create: `src/pages/contact.astro`

**Interfaces:**
- Consumes: `icons` (Task 4), `BaseLayout` (Task 3).

- [ ] **Step 1: Create `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';

const EmailIcon = icons['mdi/email'];
const GithubIcon = icons['mdi/github'];
const LinkedinIcon = icons['mdi/linkedin'];
---

<BaseLayout title="Contact — Jarrett Dominic">
	<section id="contact">
		<h2>Contact</h2>
		<p>Have a project in mind or just want to say hi? Reach out.</p>
		<a class="email-link" href="mailto:jarrettdominic@proton.me">
			<EmailIcon /><span>jarrettdominic@proton.me</span>
		</a>
		<div class="social-links">
			<a href="https://github.com/FlooffyKitsune" target="_blank" rel="noopener noreferrer">
				<GithubIcon />
			</a>
			<a
				href="https://www.linkedin.com/in/jarrett-dominic/"
				target="_blank"
				rel="noopener noreferrer"
			>
				<LinkedinIcon />
			</a>
		</div>
	</section>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	#contact {
		width: 100%;
		min-height: 30rem;
		padding: 8rem 13% 10rem;
		background-color: $color-bg;
		color: $color-text;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;

		h2 {
			font-family: $font-heading;
			font-size: 2.5rem;
			margin-bottom: 1rem;
			background-image: $gradient-warm;
			-webkit-text-fill-color: transparent;
			-webkit-background-clip: text;
		}

		p {
			font-family: $font-body;
			font-size: 1.25rem;
			margin-bottom: 2rem;
		}

		.email-link {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			font-size: 1.5rem;
			color: $color-text;
			text-decoration: none;
			margin-bottom: 2rem;
			transition: color 0.2s ease-in-out;

			&:hover {
				color: #e4b7e5;
			}
		}

		.social-links {
			display: flex;
			gap: 1.5rem;

			a {
				color: $color-text;
				font-size: 2.5rem;
				transition: color 0.2s ease-in-out;

				&:hover {
					color: #e4b7e5;
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		#contact {
			padding: 6rem 1.5rem 4rem;
		}
	}
</style>
```

- [ ] **Step 2: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/contact` — expected: mailto link and GitHub/LinkedIn icons all clickable and correctly targeted.

- [ ] **Step 3: Commit**

```bash
git add src/pages/contact.astro
git commit -m "feat: add contact page"
```

---

### Task 10: Homepage (temporary static hero)

**Files:**
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: `icons` (Task 4), `BaseLayout` (Task 3).
- Produces: the `main` / `.landing-wrapper` / `.gradient` markup and styles that the follow-up 3D-hero plan will replace with `Hero3D/Hero3DFallback` — same `BaseLayout` wrapper, same route (`/`), so nothing else needs to change when that happens.

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { icons } from '../components/ui/icons';

const GithubIcon = icons['mdi/github'];
const LinkedinIcon = icons['mdi/linkedin'];
---

<BaseLayout title="Jarrett Dominic">
	<main>
		<img id="background" src="/images/svg/wave.svg" alt="" />
		<div class="landing-wrapper">
			<div class="landing-content">
				<h1>Hi, I am Jarrett Dominic.</h1>
				<p>I'm a Full-Stack Developer based in Tampa, Florida.</p>
			</div>
			<div class="button-wrapper">
				<a href="https://github.com/FlooffyKitsune" target="_blank" rel="noopener noreferrer">
					<GithubIcon />
				</a>
				<a
					href="https://www.linkedin.com/in/jarrett-dominic/"
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkedinIcon />
				</a>
			</div>
		</div>
		<div class="gradient"></div>
	</main>
</BaseLayout>

<style lang="scss">
	@import '../styles/tokens';

	main {
		width: 100%;
		height: 50rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: $color-text;
		font-family: $font-heading;
		margin-bottom: -2rem;
		position: relative;

		#background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: calc(50rem + 96px);
			object-fit: cover;
			object-position: center;
			z-index: -1;
			opacity: 0.2;
		}

		.gradient {
			width: 100%;
			height: 6rem;
			background: linear-gradient(to bottom, rgba(255, 0, 191, 0), $color-bg);
			position: absolute;
			top: 50rem;
			border-bottom: $color-bg 2rem solid;
		}
	}

	.landing-wrapper {
		display: flex;
		flex-direction: row-reverse;
		width: 100%;

		.landing-content {
			width: 63%;
			padding: 0 2rem;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;
			border-left: $color-text 1px solid;

			h1 {
				font-family: $font-heading-serif;
				font-size: 3rem;
				font-weight: 700;
				background: $gradient-purple;
				-webkit-text-fill-color: transparent;
				-webkit-background-clip: text;
			}

			p {
				font-size: 1.5rem;
				padding-bottom: 2rem;
			}
		}

		.button-wrapper {
			width: 37%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: end;
			padding-right: 1rem;

			a {
				color: $color-text;
				font-size: 2.5rem;
				transition: all 0.2s ease-in-out;

				&:hover {
					color: #e4b7e5;
				}
			}
		}
	}

	@media screen and (max-width: $breakpoint-mobile) {
		main {
			height: 100%;
			margin: 5rem 0;

			#background {
				height: 100vh;
			}

			.gradient {
				display: none;
			}
		}

		.landing-wrapper {
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.landing-content {
				width: 100%;
				border-left: none;
				border-bottom: $color-text 1px solid;
				padding: 0 2rem;
				text-align: center;

				h1 {
					font-size: 2rem;
				}

				p {
					font-size: 1.2rem;
				}
			}

			.button-wrapper {
				width: 100%;
				padding: 0;
				margin-top: 1rem;
				flex-direction: row;
				justify-content: center;
				align-items: center;

				a {
					margin: 0 1rem;
				}
			}
		}
	}
</style>
```

- [ ] **Step 2: Verify it builds and renders**

```bash
npm run build
npm run dev
```

Open `http://localhost:4321/` — expected: hero renders with heading, tagline, wave background, GitHub/LinkedIn links, matching the current site's homepage look.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add temporary static homepage hero"
```

---

### Task 11: Final integration pass

**Files:**
- Modify: `README.md`
- Delete: `package-lock.json` (regenerated fresh for the new dependency tree)

**Interfaces:**
- Consumes: every page/component from Tasks 1–10.

- [ ] **Step 1: Regenerate the lockfile cleanly**

```bash
rm package-lock.json
rm -rf node_modules
npm install
```

- [ ] **Step 2: Full verification pass**

```bash
npm run check
npm run build
npm run preview
```

Manually visit every route in the preview server and confirm: `/`, `/about`, `/skills`, `/projects`, `/portfolio`, `/contact` all render correctly, the header nav works from every page (including at a mobile viewport width), and the footer year is correct.

- [ ] **Step 3: Update `README.md`**

```md
Portfolio site for Jarrett Dominic — built with Astro and Svelte islands. Content lives in `src/content` (Projects, Portfolio) and `src/data` (Skills). The homepage hero is a placeholder pending the Three.js 3D hero (see `docs/superpowers/plans/2026-08-06-threejs-hero-hotspot-nav.md`).
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: regenerate lockfile, update README"
```

---

## Self-Review Notes

- **Spec coverage:** Stack & rendering (Task 1), design tokens (Task 2), BaseLayout/Header/Footer/view-transitions (Task 3), icon registry + shared card (Task 4), Projects collection (Task 5), Portfolio collection (Task 6), Skills data (Task 7), About (Task 8), Contact (Task 9), Home/temporary hero (Task 10), asset migration (`static/`→`public/`, Task 1) and cleanup (Task 11) are all covered. The 3D hero itself is intentionally out of this plan — see the companion plan `2026-08-06-threejs-hero-hotspot-nav.md`.
- **Type consistency:** `WorkCard`'s `Props` (`stack: string[]`, `links: {href, label, iconKey}[]`) matches the `workEntry` Zod schema in `content/config.ts` and how Tasks 5–6 call `<WorkCard ... />`. `SkillGroup`'s `Props` matches the `SkillItem`/`SkillGroup` types exported from `data/skills.ts`. The `icons` registry's key strings are used identically across `WorkCard`, `SkillGroup`, `about.astro`, `contact.astro`, and `index.astro`.
- **No placeholders:** every file has real, final content for this pass; the only intentionally deferred piece (the 3D hero) is scoped to the companion plan, not left as a TODO inside this one.
