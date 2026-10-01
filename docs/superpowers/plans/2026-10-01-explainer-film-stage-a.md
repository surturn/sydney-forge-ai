# Explainer Film — Stage A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stacked-scene portfolio with the film engine, the timed cold-open reel, and the opening shots (Cover, Who, What, Solves, For) plus an interim back cover, in the Matatu pop editorial look, driven by validated content files.

**Architecture:** A sticky stage inside a tall spacer; native scroll (smoothed by Lenis) scrubs one GSAP master timeline assembled from per-shot sub-timelines registered in a pure `registry`. Discrete state (active shot, mode, reel state) lives in zustand; per-frame values live in the mutable `scrollState`. Content is read at build time by a Vite plugin that validates it with zod and exposes `virtual:content`. Article mode renders the same DOM as a normal document with no GSAP or Lenis.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind 3, GSAP 3 + ScrollTrigger, Lenis, zustand, zod, yaml, marked (build-time only), Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-01-explainer-film-design.md`

## Global Constraints

- Branch `feat/explainer-film`. Commit after every task. No AI attribution lines in commit messages.
- Palette (spec §3): paper `#FFF3E2` / `35 100% 94%`, paper-raised `#FFFFFF` / `0 0% 100%`, ink `#14121F` / `249 27% 10%`, ink-muted `#5A5470` / `253 14% 38%`, cobalt `#2340FF` / `232 100% 57%`, signal `#FF4F1F` / `13 100% 56%`, lime `#C8F031` / `73 86% 57%`.
- Signal and lime are never text colours on paper. Lime is never a meaningful boundary on paper.
- Square corners everywhere (`--radius: 0rem`).
- Fonts: Bodoni Moda (roman 700 + italic 500), Inter Tight 400/500/600, IBM Plex Mono 400/500, via Google Fonts `<link>` with `display=swap` and both preconnects (the gstatic one `crossorigin`).
- Animate only `transform`, `opacity`, `clip-path`, and `autoAlpha`. Never `width`, `height`, `top`, `left`, `filter`, `box-shadow`.
- Nothing subscribes to scroll progress through React state. React re-renders only on `activeShot`, `mode`, `reelState` changes.
- Never install `three`, `@react-three/fiber`, `@react-three/drei`. Remove `framer-motion`.
- No `dangerouslySetInnerHTML` anywhere. No `alert`/`confirm`/`prompt`.
- Copy rules (spec §1): never "senior"; claim is "AI systems"; features a README marks as designed or long-term are labelled "In progress".
- The phone number never appears in the repository. (Stage C; nothing in Stage A uses it.)
- Every featured project figure that is stock or generated carries `placeholder: true`.
- All `localStorage` / `sessionStorage` access is wrapped in try/catch.

## Review Focus

1. **Windows line endings in content files** — this repo checks out with CRLF; front-matter parsing must normalise `\r\n` before splitting, or every Markdown project fails to parse on the owner's machine. Pinned in Task 3.
2. **React StrictMode / remount double-building the timeline** — the engine must revert its `gsap.context`, remove its ticker callback, and destroy Lenis on cleanup so a remount does not stack two ScrollTriggers. Pinned in Task 5.
3. **Storage unavailable** (private mode, blocked cookies) — reading or writing the reel flag or the mode choice must not throw; the page falls back to defaults. Pinned in Tasks 4 and 7.
4. **Input during the reel** — a wheel, touch-move, or key press while the reel plays must end the reel immediately, never block the scroll. Pinned in Task 7.
5. **Seeking to a shot that does not exist yet** (Stage A has no project shots) — proof chips and CTAs must fall back to an existing shot instead of doing nothing or throwing. Pinned in Task 6.

---

## File map

| File | Responsibility |
|---|---|
| `src/content/schema.ts` | zod schemas + exported types for every content file and the Markdown node tree |
| `vite/loadContent.ts` | Node-side: read `src/content/`, parse, validate, cross-check references, return `Content` |
| `vite/markdown.ts` | Node-side: Markdown body → restricted node tree |
| `vite/content.ts` | Vite plugin exposing `virtual:content`, with HMR invalidation |
| `src/content/virtual.d.ts` | Type declaration for `virtual:content` |
| `src/content/index.ts` | App-side accessors: `content`, `projectById`, `featuredProjects`, `indexProjects` |
| `src/content/*.json`, `src/content/projects/*.md` | The content |
| `src/film/registry.ts` | Pure shot placement, lookup, validation, seek maths |
| `src/film/store.ts` | zustand discrete state + `resolveMode` + storage helpers |
| `src/film/engine.ts` | Module-level handle on the live Lenis instance and placed shots |
| `src/film/useFilm.ts` | Builds/destroys Lenis + master timeline + ScrollTrigger |
| `src/film/Stage.tsx` | Spacer + sticky stage; renders shots; article layout |
| `src/film/Shot.tsx` | Per-shot section wrapper; `inert` when inactive |
| `src/film/seek.ts` | `seekToShot(id)` |
| `src/film/Reel.tsx` | Timed cold-open overlay + timeline |
| `src/shots/*.tsx` | Shot components, each exporting `def` and `build` |
| `src/shots/index.ts` | Ordered list of shots |
| `src/chrome/*.tsx` | Chapter bar, Work-with-me, mode toggle, skip link, reel controls |
| `src/lib/scrollStore.ts` | Reduced to `scrollState` (progress, velocity) |
| `scripts/make-placeholders.mjs` | Writes labelled SVG placeholders into `public/images/placeholders/` |

---

### Task 1: Dependencies and audit baseline

**Files:**
- Modify: `package.json`, `package-lock.json`
- Modify: `src/__tests__/design/deps.test.ts`

**Interfaces:**
- Produces: `gsap`, `zod`, `yaml`, `marked` available; `framer-motion` still present (removed in Task 10 once nothing imports it).

- [ ] **Step 1: Update the dependency test first**

Replace `src/__tests__/design/deps.test.ts` with:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

describe('dependencies', () => {
  it('has the film engine installed', () => {
    for (const name of ['gsap', 'lenis', 'zustand', 'zod']) {
      expect(deps, `${name} should be installed`).toHaveProperty(name)
    }
  })

  it('has the build-time content tooling as dev dependencies', () => {
    expect(pkg.devDependencies).toHaveProperty('yaml')
    expect(pkg.devDependencies).toHaveProperty('marked')
  })

  it('no longer ships the retired router and page libraries', () => {
    for (const gone of [
      'react-router-dom', 'recharts', '@tanstack/react-query',
      'react-hook-form', '@hookform/resolvers', 'embla-carousel-react',
      'react-day-picker', 'date-fns', 'cmdk', 'vaul', 'input-otp',
      'react-resizable-panels', 'next-themes', 'sonner',
    ]) {
      expect(deps, `${gone} should be removed`).not.toHaveProperty(gone)
    }
  })

  it('never installs a 3D stack', () => {
    for (const name of ['three', '@react-three/fiber', '@react-three/drei']) {
      expect(deps).not.toHaveProperty(name)
    }
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/__tests__/design/deps.test.ts`
Expected: FAIL — `gsap should be installed`.

- [ ] **Step 3: Install**

```bash
npm install gsap zod
npm install -D yaml marked
```

- [ ] **Step 4: Clear the audit baseline**

The suite's `security/dependencies.test.ts` fails on `main` today (critical advisories). Run:

```bash
npm audit fix
npm audit --audit-level=critical
```

Expected: the second command exits 0. Do not use `--force`. If a critical remains that only `--force` fixes, stop and report the package and advisory to the owner instead.

- [ ] **Step 5: Run the dependency and security tests**

Run: `npx vitest run src/__tests__/design/deps.test.ts src/__tests__/security/dependencies.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/__tests__/design/deps.test.ts
git commit -m "chore: add GSAP, zod and build-time content tooling; clear audit criticals"
```

---

### Task 2: Matatu pop tokens, fonts, and contrast guard

**Files:**
- Modify: `src/index.css` (full rewrite)
- Modify: `tailwind.config.ts` (fonts unchanged; `colors` block replaced; `sidebar` removed)
- Modify: `index.html` (font URL, title, description, OG text)
- Replace: `src/__tests__/design/tokens.test.ts`
- Create: `src/__tests__/design/contrast.test.ts`

**Interfaces:**
- Produces CSS custom properties `--paper --paper-raised --ink --ink-muted --cobalt --signal --lime` (HSL triplets), semantic aliases `--background --foreground --primary --ring --border`, utility classes `.display`, `.standfirst`, `.kicker`, `.meta`, `.chip`, `.btn-signal`, `.btn-outline`, `.rule`, `.livery`, `.paper-texture`, `.sr-only` (Tailwind's), Tailwind colours `paper`, `ink`, `cobalt`, `signal`, `lime` (with `paper.raised`, `ink.muted`).

- [ ] **Step 1: Write the contrast test**

Create `src/__tests__/design/contrast.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')

function token(name: string): [number, number, number] {
  const m = css.match(new RegExp(`--${name}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`))
  if (!m) throw new Error(`token --${name} not found`)
  return [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100]
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)]
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string) {
  const [x, y] = [luminance(hslToRgb(token(a))), luminance(hslToRgb(token(b)))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

describe('palette contrast (WCAG 2.2 AA)', () => {
  it.each([
    ['ink', 'paper', 4.5],
    ['ink-muted', 'paper', 4.5],
    ['ink-muted', 'paper-raised', 4.5],
    ['cobalt', 'paper', 4.5],
    ['ink', 'signal', 4.5],
    ['ink', 'lime', 4.5],
    ['paper', 'cobalt', 4.5],
    ['paper', 'ink', 4.5],
    ['lime', 'ink', 4.5],
    ['signal', 'ink', 4.5],
  ])('%s on %s reaches %s:1', (fg, bg, min) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min)
  })

  it('signal on paper is large-text-only territory (3:1)', () => {
    expect(ratio('signal', 'paper')).toBeGreaterThanOrEqual(2.9)
    expect(ratio('signal', 'paper')).toBeLessThan(4.5)
  })

  it('cobalt focus ring is a visible boundary on paper (3:1)', () => {
    expect(ratio('cobalt', 'paper')).toBeGreaterThanOrEqual(3)
  })
})
```

- [ ] **Step 2: Replace the token test**

Replace `src/__tests__/design/tokens.test.ts` with:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')
const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')
const tw = readFileSync(join(process.cwd(), 'tailwind.config.ts'), 'utf-8')

describe('Matatu pop design tokens', () => {
  it('defines the palette', () => {
    expect(css).toContain('--paper: 35 100% 94%')
    expect(css).toContain('--ink: 249 27% 10%')
    expect(css).toContain('--cobalt: 232 100% 57%')
    expect(css).toContain('--signal: 13 100% 56%')
    expect(css).toContain('--lime: 73 86% 57%')
  })

  it('maps semantic tokens onto the palette', () => {
    expect(css).toContain('--background: 35 100% 94%')
    expect(css).toContain('--foreground: 249 27% 10%')
    expect(css).toContain('--ring: 232 100% 57%')
  })

  it('keeps radius at zero and has no theme blocks', () => {
    expect(css).toContain('--radius: 0rem')
    expect(css).not.toContain('.dark {')
    expect(css).not.toMatch(/prefers-color-scheme/)
  })

  it('retires the Dusk palette', () => {
    for (const gone of ['--ground', '--amber', '--gold', '--dusk', '.dusk-bg']) {
      expect(css).not.toContain(gone)
    }
  })

  it('defines the full type scale', () => {
    for (const step of ['--step--1', '--step-0', '--step-4', '--step-8']) {
      expect(css).toContain(step)
    }
  })

  it('registers the three families and the palette in Tailwind', () => {
    expect(tw).toContain("'Bodoni Moda'")
    expect(tw).toContain("'Inter Tight'")
    expect(tw).toContain("'IBM Plex Mono'")
    expect(tw).toContain('paper')
    expect(tw).not.toContain('sidebar')
  })

  it('loads roman and italic Bodoni with the perf/security attributes', () => {
    expect(html).toContain('Bodoni+Moda:ital,opsz,wght@')
    expect(html).toContain('IBM+Plex+Mono')
    expect(html).toContain('Inter+Tight')
    expect(html).toContain('display=swap')
    expect(html).toMatch(/rel\s*=\s*["']preconnect["']/)
    expect(html).toContain('crossorigin')
  })
})
```

- [ ] **Step 3: Run both tests to see them fail**

Run: `npx vitest run src/__tests__/design`
Expected: FAIL — `token --paper not found`, `--paper: 35 100% 94%` missing.

- [ ] **Step 4: Rewrite `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
  ISSUE 01 — Matatu pop editorial system.
  One light theme. HSL triplets. Signal and lime are fills behind ink,
  never text on paper. Square corners throughout.
*/

@layer base {
  :root {
    --paper: 35 100% 94%;
    --paper-raised: 0 0% 100%;
    --ink: 249 27% 10%;
    --ink-muted: 253 14% 38%;
    --cobalt: 232 100% 57%;
    --signal: 13 100% 56%;
    --lime: 73 86% 57%;

    --background: 35 100% 94%;
    --foreground: 249 27% 10%;
    --primary: 13 100% 56%;
    --primary-foreground: 249 27% 10%;
    --muted-foreground: 253 14% 38%;
    --border: 249 27% 10% / 0.18;
    --ring: 232 100% 57%;
    --radius: 0rem;

    --ease-film: cubic-bezier(0.16, 1, 0.3, 1);

    --step--1: 0.75rem;
    --step-0: 1rem;
    --step-1: 1.333rem;
    --step-2: 1.777rem;
    --step-3: 2.369rem;
    --step-4: 3.157rem;
    --step-5: 4.209rem;
    --step-6: 5.61rem;
    --step-7: 7.478rem;
    --step-8: 9.969rem;
  }

  /* Fallback metrics so the web-font swap does not shift layout. */
  @font-face {
    font-family: 'Bodoni Fallback';
    src: local('Georgia');
    size-adjust: 96%;
    ascent-override: 92%;
    descent-override: 24%;
  }
  @font-face {
    font-family: 'Inter Tight Fallback';
    src: local('Arial');
    size-adjust: 95%;
    ascent-override: 96%;
    descent-override: 24%;
  }

  html {
    background: hsl(var(--paper));
  }

  body {
    @apply font-sans antialiased;
    background: hsl(var(--paper));
    color: hsl(var(--ink));
    line-height: 1.6;
  }

  ::selection {
    background: hsl(var(--lime));
    color: hsl(var(--ink));
  }

  :focus-visible {
    outline: 2px solid hsl(var(--cobalt));
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer components {
  .display {
    @apply font-display;
    font-weight: 700;
    font-variation-settings: 'opsz' 96;
    letter-spacing: -0.02em;
    line-height: 0.9;
  }

  .standfirst {
    @apply font-display;
    font-style: italic;
    font-weight: 500;
    line-height: 1.35;
  }

  .kicker {
    @apply font-mono uppercase;
    font-size: var(--step--1);
    letter-spacing: 0.12em;
    color: hsl(var(--cobalt));
  }

  .meta {
    @apply font-mono uppercase;
    font-size: var(--step--1);
    letter-spacing: 0.12em;
    color: hsl(var(--ink-muted));
  }

  .chip {
    @apply inline-flex items-center font-mono uppercase;
    min-height: 1.75rem;
    padding: 0.25rem 0.6rem;
    font-size: var(--step--1);
    letter-spacing: 0.08em;
    background: hsl(var(--lime));
    color: hsl(var(--ink));
  }

  .btn-signal {
    @apply inline-flex items-center justify-center font-medium;
    min-height: 2.75rem;
    padding: 0.6rem 1.25rem;
    background: hsl(var(--signal));
    color: hsl(var(--ink));
  }

  .btn-outline {
    @apply inline-flex items-center justify-center font-medium;
    min-height: 2.75rem;
    padding: 0.55rem 1.2rem;
    border: 1.5px solid hsl(var(--cobalt));
    color: hsl(var(--cobalt));
  }

  .rule {
    height: 2px;
    background: hsl(var(--ink));
  }

  .livery {
    height: 0.6rem;
    background: repeating-linear-gradient(
      90deg,
      hsl(var(--signal)) 0 3rem,
      hsl(var(--cobalt)) 3rem 6rem,
      hsl(var(--lime)) 6rem 9rem
    );
  }

  .paper-texture::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 60;
    opacity: 0.06;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }
}
```

- [ ] **Step 5: Update `tailwind.config.ts`**

Replace the `fontFamily` and `colors` keys inside `extend`, and delete the `sidebar` block:

```ts
      fontFamily: {
        sans: ['Inter Tight', 'Inter Tight Fallback', 'system-ui', 'sans-serif'],
        display: ['Bodoni Moda', 'Bodoni Fallback', 'Didot', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: { DEFAULT: 'hsl(var(--paper))', raised: 'hsl(var(--paper-raised))' },
        ink: { DEFAULT: 'hsl(var(--ink))', muted: 'hsl(var(--ink-muted))' },
        cobalt: 'hsl(var(--cobalt))',
        signal: 'hsl(var(--signal))',
        lime: 'hsl(var(--lime))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        muted: { foreground: 'hsl(var(--muted-foreground))' },
      },
```

- [ ] **Step 6: Update `index.html`**

Replace the stylesheet `<link>` href with:

```
https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,700;1,6..96,500&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600&display=swap
```

Replace title, description, keywords, `og:title`, `og:description` with:

```html
  <title>Sydney Kamau — Full-Stack Engineer, AI Systems · Nairobi</title>
  <meta name="description"
    content="Full-stack engineer with depth in AI systems, Nairobi. Payments under load, offline-first apps, RAG pipelines. Founder of Invonics Technologies." />
  <meta name="keywords"
    content="Full-Stack Engineer, AI Systems, RAG, M-Pesa, Django, FastAPI, Fastify, React, Kotlin, Nairobi" />
  <meta property="og:title" content="Sydney Kamau — Full-Stack Engineer, AI Systems" />
  <meta property="og:description"
    content="Full-stack engineer with depth in AI systems, Nairobi. Founder of Invonics Technologies." />
```

Delete the `twitter:site` meta (the handle is unverified).

- [ ] **Step 7: Run the design tests**

Run: `npx vitest run src/__tests__/design src/__tests__/security/headers.test.ts src/__tests__/speed/core-web-vitals.test.ts`
Expected: PASS. (`SceneFrame` and the old scenes still reference `.dusk-bg` / `--amber`; they are visually broken until Task 10 deletes them — acceptable mid-branch.)

- [ ] **Step 8: Commit**

```bash
git add src/index.css tailwind.config.ts index.html src/__tests__/design
git commit -m "feat: replace Dusk with the Matatu pop editorial palette and type"
```

---

### Task 3: Content schema, files, and the build-time plugin

**Files:**
- Create: `src/content/schema.ts`, `vite/markdown.ts`, `vite/loadContent.ts`, `vite/content.ts`, `src/content/virtual.d.ts`, `src/content/index.ts`
- Create: `src/content/profile.json`, `site.json`, `contact.json`, `credentials.json`, `offhours.json`
- Create: `src/content/projects/{assetflow,eventify,digital-twin,farmassist,forus,lucklotter,invonics-crm,invonics-automations}.md`
- Create: `scripts/make-placeholders.mjs`, `public/images/placeholders/*.svg` (generated)
- Modify: `vite.config.ts`, `vitest.config.ts`, `tsconfig.node.json` (include `vite/**/*.ts`)
- Create: `src/__tests__/content/loadContent.test.ts`
- Delete: `src/__tests__/content/content.test.ts` (tests the retired `content.ts`; the file itself is deleted in Task 10)

**Interfaces:**
- Produces (`src/content/schema.ts`):
  - `type Media = { src: string; alt: string; width: number; height: number; credit?: string; placeholder?: boolean }`
  - `type FlowStep = { from: string; to: string; label: string; kind?: 'fail' | 'recover' }`
  - `type Flow = { actors: string[]; steps: FlowStep[] }`
  - `type Inline = { t: 'text'; v: string } | { t: 'strong' | 'em'; c: Inline[] } | { t: 'code'; v: string } | { t: 'link'; href: string; c: Inline[] }`
  - `type Block = { t: 'p'; c: Inline[] } | { t: 'ul'; items: Inline[][] }`
  - `type Project = ProjectFront & { body: Block[] }`
  - `type Profile`, `type Site`, `type Contact`, `type Credential`, `type OffHours`, `type Content = { profile; site; contact; credentials; offhours; projects: Project[] }`
- Produces (`vite/loadContent.ts`): `loadContent(dir: string): { content: Content; files: string[] }` — throws `ContentError` whose message starts with the file path.
- Produces (`src/content/index.ts`): `content: Content`, `projectById(id: string): Project | undefined`, `featuredProjects: Project[]`, `indexProjects: Project[]`.

- [ ] **Step 1: Write the schema**

Create `src/content/schema.ts`:

```ts
import { z } from 'zod';

export const MediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  credit: z.string().optional(),
  placeholder: z.boolean().optional(),
});

export const FlowStepSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().min(1).max(60),
  kind: z.enum(['fail', 'recover']).optional(),
});

export const FlowSchema = z.object({
  actors: z.array(z.string().min(1)).min(2).max(5),
  steps: z.array(FlowStepSchema).min(2).max(9),
});

export const ProjectFrontSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
    name: z.string().min(1),
    status: z.enum(['Live', 'Beta', 'In progress', 'Live (internal)']),
    tier: z.enum(['featured', 'index']),
    order: z.number().int(),
    repo: z.object({ url: z.string().url().nullable(), private: z.boolean() }),
    liveUrl: z.string().url().optional(),
    standfirst: z.string().min(1).max(160),
    problem: z.string().max(140).optional(),
    stack: z.array(z.string().min(1)).min(1),
    figure: MediaSchema.optional(),
    flow: FlowSchema.optional(),
    outcome: z.string().max(200).optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.tier === 'featured') {
      for (const key of ['flow', 'problem', 'figure', 'outcome'] as const) {
        if (p[key] === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `featured projects need ${key}` });
        }
      }
    }
    if (p.tier === 'index' && p.flow) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flow'], message: 'index projects must not have a flow' });
    }
    if (p.flow) {
      p.flow.steps.forEach((s, i) => {
        for (const end of ['from', 'to'] as const) {
          if (!p.flow!.actors.includes(s[end])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['flow', 'steps', i, end],
              message: `actor "${s[end]}" is not in flow.actors`,
            });
          }
        }
      });
    }
    if (p.figure && p.figure.src.includes('/placeholders/') && !p.figure.placeholder) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['figure', 'placeholder'], message: 'placeholder figures must set placeholder: true' });
    }
    if (p.repo.private && p.repo.url !== null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['repo', 'url'], message: 'private repos must have url: null' });
    }
  });

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong' | 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; c: Inline[] };

export type Block = { t: 'p'; c: Inline[] } | { t: 'ul'; items: Inline[][] };

export const ProfileSchema = z
  .object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    coords: z.string(),
    email: z.string().email(),
    github: z.string().url(),
    linkedin: z.string().url(),
    company: z.string(),
    companyUrl: z.string().url(),
    portrait: MediaSchema,
    cover: z.object({
      kicker: z.string(),
      standfirst: z.string().max(140),
      chips: z.array(z.string()).min(1).max(4),
    }),
    who: z.object({ heading: z.string(), body: z.string(), invonics: z.string() }),
    what: z.object({
      heading: z.string(),
      body: z.string(),
      layers: z.array(z.object({ name: z.string(), items: z.array(z.string()).min(1) })).min(3).max(6),
    }),
    solves: z.object({
      heading: z.string(),
      items: z.array(z.object({ condition: z.string().max(90), proof: z.array(z.string()).min(1) })).min(3).max(8),
    }),
    for: z.object({ heading: z.string(), sectors: z.array(z.string()).min(3), tail: z.string() }),
  })
  .strict();

export const SiteSchema = z
  .object({
    issue: z.string(),
    issueDate: z.string(),
    chapters: z.object({ cover: z.string(), profile: z.string(), work: z.string(), contact: z.string() }),
  })
  .strict();

export const LinkSchema = z.object({
  label: z.string(),
  href: z.string().regex(/^(https:\/\/|mailto:)/, 'links must be https: or mailto:'),
  kind: z.enum(['email', 'github', 'linkedin', 'invonics']),
});

export const ContactSchema = z
  .object({
    heading: z.string(),
    email: z.string().email(),
    cvPath: z.string().startsWith('/'),
    bookingUrl: z.string().url().nullable(),
    project: z.object({ subject: z.string(), body: z.string() }),
    links: z.array(LinkSchema).min(1),
    colophon: z.string(),
  })
  .strict();

export const CredentialSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  period: z.string(),
  note: z.string(),
});

export const OffHoursSchema = z
  .object({ heading: z.string(), items: z.array(z.object({ title: z.string(), body: z.string() })).min(1) })
  .strict();

export type Media = z.infer<typeof MediaSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type ProjectFront = z.infer<typeof ProjectFrontSchema>;
export type Project = ProjectFront & { body: Block[] };
export type Profile = z.infer<typeof ProfileSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type OffHours = z.infer<typeof OffHoursSchema>;

export type Content = {
  profile: Profile;
  site: Site;
  contact: Contact;
  credentials: Credential[];
  offhours: OffHours;
  projects: Project[];
};
```

- [ ] **Step 2: Write the loader test**

Create `src/__tests__/content/loadContent.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { loadContent } from '../../../vite/loadContent'

const REAL = join(process.cwd(), 'src/content')
let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'content-'))
  cpSync(REAL, dir, { recursive: true, filter: (p) => !p.endsWith('.ts') })
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

const edit = (rel: string, fn: (s: string) => string) => {
  const p = join(dir, rel)
  writeFileSync(p, fn(readFileSync(p, 'utf-8')))
}

describe('loadContent', () => {
  it('loads the real content', () => {
    const { content } = loadContent(REAL)
    expect(content.profile.name).toBe('Sydney Kamau')
    expect(content.projects.filter((p) => p.tier === 'featured').map((p) => p.id)).toEqual([
      'assetflow', 'eventify', 'digital-twin', 'farmassist', 'forus',
    ])
    expect(content.projects.filter((p) => p.tier === 'index')).toHaveLength(3)
  })

  it('sorts projects by order', () => {
    const { content } = loadContent(REAL)
    const orders = content.projects.map((p) => p.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('parses files saved with Windows line endings', () => {
    edit('projects/eventify.md', (s) => s.replace(/\r?\n/g, '\r\n'))
    const { content } = loadContent(dir)
    expect(content.projects.find((p) => p.id === 'eventify')?.flow?.actors).toContain('M-Pesa')
  })

  it('names the file and field when a required field is missing', () => {
    edit('projects/eventify.md', (s) => s.replace(/^standfirst:.*\r?\n/m, ''))
    expect(() => loadContent(dir)).toThrow(/eventify\.md[\s\S]*standfirst/)
  })

  it('rejects a cover chip that names no project', () => {
    edit('profile.json', (s) => s.replace('"eventify"', '"evntify"'))
    expect(() => loadContent(dir)).toThrow(/profile\.json[\s\S]*evntify/)
  })

  it('rejects a solves proof that names no project', () => {
    edit('profile.json', (s) => s.replace('"proof": ["digital-twin"]', '"proof": ["twin"]'))
    expect(() => loadContent(dir)).toThrow(/profile\.json[\s\S]*twin/)
  })

  it('rejects a flow step naming an unknown actor', () => {
    edit('projects/eventify.md', (s) => s.replace('from: Gate, to: Gate', 'from: Turnstile, to: Gate'))
    expect(() => loadContent(dir)).toThrow(/eventify\.md[\s\S]*Turnstile/)
  })

  it('rejects a placeholder figure without placeholder: true', () => {
    edit('projects/farmassist.md', (s) => s.replace('placeholder: true', 'placeholder: false'))
    expect(() => loadContent(dir)).toThrow(/farmassist\.md[\s\S]*placeholder/)
  })

  it('rejects unsupported markdown in a body', () => {
    edit('projects/forus.md', (s) => s + '\n\n# A heading\n')
    expect(() => loadContent(dir)).toThrow(/forus\.md[\s\S]*heading/)
  })

  it('rejects duplicate project ids', () => {
    edit('projects/forus.md', (s) => s.replace('id: forus', 'id: eventify'))
    expect(() => loadContent(dir)).toThrow(/duplicate project id "eventify"/)
  })

  it('converts a body to the restricted node tree', () => {
    const { content } = loadContent(REAL)
    const body = content.projects.find((p) => p.id === 'eventify')!.body
    expect(body.length).toBeGreaterThan(0)
    expect(['p', 'ul']).toContain(body[0].t)
  })

  it('never uses the word senior', () => {
    const { content } = loadContent(REAL)
    expect(JSON.stringify(content).toLowerCase()).not.toContain('senior')
  })
})
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/__tests__/content/loadContent.test.ts`
Expected: FAIL — cannot resolve `../../../vite/loadContent`.

- [ ] **Step 4: Write the Markdown converter**

Create `vite/markdown.ts`:

```ts
import { marked, type Token, type Tokens } from 'marked';
import type { Block, Inline } from '../src/content/schema';

export class MarkdownError extends Error {}

function inline(tokens: Token[] | undefined): Inline[] {
  const out: Inline[] = [];
  for (const tok of tokens ?? []) {
    switch (tok.type) {
      case 'text':
      case 'escape': {
        const t = tok as Tokens.Text;
        if (t.tokens && t.tokens.length) out.push(...inline(t.tokens));
        else out.push({ t: 'text', v: t.text });
        break;
      }
      case 'strong':
        out.push({ t: 'strong', c: inline((tok as Tokens.Strong).tokens) });
        break;
      case 'em':
        out.push({ t: 'em', c: inline((tok as Tokens.Em).tokens) });
        break;
      case 'codespan':
        out.push({ t: 'code', v: (tok as Tokens.Codespan).text });
        break;
      case 'link': {
        const l = tok as Tokens.Link;
        if (!/^(https:\/\/|mailto:|#)/.test(l.href)) {
          throw new MarkdownError(`link href must be https:, mailto: or #anchor, got "${l.href}"`);
        }
        out.push({ t: 'link', href: l.href, c: inline(l.tokens) });
        break;
      }
      case 'br':
        out.push({ t: 'text', v: ' ' });
        break;
      default:
        throw new MarkdownError(`unsupported inline markdown: ${tok.type}`);
    }
  }
  return out;
}

export function toBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  for (const tok of marked.lexer(src)) {
    switch (tok.type) {
      case 'space':
        break;
      case 'paragraph':
        blocks.push({ t: 'p', c: inline((tok as Tokens.Paragraph).tokens) });
        break;
      case 'list': {
        const list = tok as Tokens.List;
        if (list.ordered) throw new MarkdownError('unsupported markdown: ordered list');
        blocks.push({ t: 'ul', items: list.items.map((item) => inline(item.tokens.flatMap((t) => ('tokens' in t && t.tokens ? t.tokens : [t])))) });
        break;
      }
      default:
        throw new MarkdownError(`unsupported markdown: ${tok.type}`);
    }
  }
  return blocks;
}
```

- [ ] **Step 5: Write the loader**

Create `vite/loadContent.ts`:

```ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { ZodSchema } from 'zod';
import {
  ContactSchema, CredentialSchema, OffHoursSchema, ProfileSchema, ProjectFrontSchema, SiteSchema,
  type Content, type Project,
} from '../src/content/schema';
import { toBlocks } from './markdown';

export class ContentError extends Error {}

const read = (p: string) => readFileSync(p, 'utf-8').replace(/\r\n?/g, '\n');

function validate<T>(file: string, schema: ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new ContentError(`${file}\n${issues}`);
  }
  return r.data;
}

function json<T>(dir: string, name: string, schema: ZodSchema<T>, files: string[]): T {
  const p = join(dir, name);
  files.push(p);
  let data: unknown;
  try {
    data = JSON.parse(read(p));
  } catch (e) {
    throw new ContentError(`${p}\n  invalid JSON: ${(e as Error).message}`);
  }
  return validate(p, schema, data);
}

function project(p: string): Project {
  const m = read(p).match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new ContentError(`${p}\n  missing front matter between --- lines`);
  let front: unknown;
  try {
    front = parseYaml(m[1]);
  } catch (e) {
    throw new ContentError(`${p}\n  invalid YAML: ${(e as Error).message}`);
  }
  const data = validate(p, ProjectFrontSchema, front);
  try {
    return { ...data, body: toBlocks(m[2]) };
  } catch (e) {
    throw new ContentError(`${p}\n  body: ${(e as Error).message}`);
  }
}

export function loadContent(dir: string): { content: Content; files: string[] } {
  const files: string[] = [];
  const profile = json(dir, 'profile.json', ProfileSchema, files);
  const site = json(dir, 'site.json', SiteSchema, files);
  const contact = json(dir, 'contact.json', ContactSchema, files);
  const credentials = json(dir, 'credentials.json', CredentialSchema.array().min(1), files);
  const offhours = json(dir, 'offhours.json', OffHoursSchema, files);

  const pdir = join(dir, 'projects');
  const projects = readdirSync(pdir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const p = join(pdir, f);
      files.push(p);
      return project(p);
    })
    .sort((a, b) => a.order - b.order);

  const ids = new Set<string>();
  for (const p of projects) {
    if (ids.has(p.id)) throw new ContentError(`projects/\n  duplicate project id "${p.id}"`);
    ids.add(p.id);
  }

  const profilePath = join(dir, 'profile.json');
  const missing = [
    ...profile.cover.chips.map((id) => ['cover.chips', id] as const),
    ...profile.solves.items.flatMap((it, i) => it.proof.map((id) => [`solves.items.${i}.proof`, id] as const)),
  ].filter(([, id]) => !ids.has(id));
  if (missing.length) {
    throw new ContentError(
      `${profilePath}\n${missing.map(([path, id]) => `  ${path}: no project with id "${id}"`).join('\n')}`,
    );
  }

  return { content: { profile, site, contact, credentials, offhours, projects }, files };
}
```

- [ ] **Step 6: Write the Vite plugin and wire it in**

Create `vite/content.ts`:

```ts
import { resolve } from 'path';
import type { Plugin } from 'vite';
import { loadContent } from './loadContent';

const VIRTUAL = 'virtual:content';
const RESOLVED = '\0' + VIRTUAL;

export function contentPlugin(dir = 'src/content'): Plugin {
  const root = resolve(dir);
  return {
    name: 'portfolio-content',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVED : undefined;
    },
    load(id) {
      if (id !== RESOLVED) return undefined;
      const { content, files } = loadContent(root);
      files.forEach((f) => this.addWatchFile(f));
      return `export default ${JSON.stringify(content)};`;
    },
    handleHotUpdate({ file, server }) {
      if (!resolve(file).startsWith(root) || file.endsWith('.ts')) return;
      const mod = server.moduleGraph.getModuleById(RESOLVED);
      if (mod) server.moduleGraph.invalidateModule(mod);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
```

In `vite.config.ts` add `import { contentPlugin } from "./vite/content";` and change `plugins: [react()]` to `plugins: [react(), contentPlugin()]`. Also add under the config object:

```ts
  build: { manifest: true },
```

In `vitest.config.ts` add the same import and `plugins: [react(), contentPlugin()]`.

In `tsconfig.node.json`, change `"include"` to `["vite.config.ts", "vitest.config.ts", "vite/**/*.ts", "src/content/schema.ts"]`.

Create `src/content/virtual.d.ts`:

```ts
declare module 'virtual:content' {
  const content: import('./schema').Content;
  export default content;
}
```

Create `src/content/index.ts`:

```ts
import data from 'virtual:content';
import type { Project } from './schema';

export const content = data;
export const projectById = (id: string): Project | undefined => data.projects.find((p) => p.id === id);
export const featuredProjects = data.projects.filter((p) => p.tier === 'featured');
export const indexProjects = data.projects.filter((p) => p.tier === 'index');
export type * from './schema';
```

- [ ] **Step 7: Generate placeholder images**

Create `scripts/make-placeholders.mjs`:

```js
import { mkdirSync, writeFileSync } from 'fs';

const OUT = 'public/images/placeholders';
mkdirSync(OUT, { recursive: true });

const slots = [
  ['portrait', 1200, 1500, 'Portrait — photo coming', '#2340FF', '#FFF3E2'],
  ['assetflow', 1600, 1000, 'AssetFlow — screenshot coming', '#14121F', '#C8F031'],
  ['eventify', 1600, 1000, 'Eventify — screenshot coming', '#FF4F1F', '#14121F'],
  ['digital-twin', 1600, 1000, 'Digital Twin — screenshot coming', '#2340FF', '#FFF3E2'],
  ['farmassist', 1600, 1000, 'FarmAssist — screenshot coming', '#C8F031', '#14121F'],
  ['forus', 1000, 1600, 'FoRUs — screens coming', '#14121F', '#FF4F1F'],
];

for (const [id, w, h, label, bg, fg] of slots) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="100%" height="100%" fill="${bg}"/>
<g stroke="${fg}" stroke-width="3" fill="none" opacity=".5">
<path d="M40 40h80M40 40v80M${w - 40} 40h-80M${w - 40} 40v80M40 ${h - 40}h80M40 ${h - 40}v-80M${w - 40} ${h - 40}h-80M${w - 40} ${h - 40}v-80"/>
</g>
<text x="50%" y="50%" fill="${fg}" font-family="IBM Plex Mono, monospace" font-size="${Math.round(w / 32)}" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${label.toUpperCase()}</text>
</svg>`;
  writeFileSync(`${OUT}/${id}.svg`, svg);
}
console.log(`wrote ${slots.length} placeholders to ${OUT}`);
```

Run: `node scripts/make-placeholders.mjs`
Expected: `wrote 6 placeholders to public/images/placeholders`.

- [ ] **Step 8: Write the JSON content**

`src/content/site.json`:

```json
{
  "issue": "01",
  "issueDate": "October 2026",
  "chapters": { "cover": "Cover", "profile": "Profile", "work": "Work", "contact": "Contact" }
}
```

`src/content/profile.json`:

```json
{
  "name": "Sydney Kamau",
  "role": "Full-Stack Engineer · AI Systems",
  "location": "Nairobi, Kenya",
  "coords": "-1.2921°, 36.8219°",
  "email": "sydneykamau2005@gmail.com",
  "github": "https://github.com/surturn",
  "linkedin": "https://www.linkedin.com/in/sydney-kamau-991b362a2/",
  "company": "Invonics Technologies",
  "companyUrl": "https://invonicstechnologies.com",
  "portrait": {
    "src": "/images/placeholders/portrait.svg",
    "alt": "Portrait of Sydney Kamau",
    "width": 1200,
    "height": 1500,
    "placeholder": true
  },
  "cover": {
    "kicker": "Full-stack engineer · AI systems",
    "standfirst": "The technical person you bring in when a project needs a solution nobody has drawn yet.",
    "chips": ["assetflow", "eventify", "digital-twin"]
  },
  "who": {
    "heading": "Engineer. Founder.",
    "body": "Full-stack engineer with depth in AI and AI infrastructure, based in Nairobi. The technical person you bring in when a project needs a solution nobody has drawn yet.",
    "invonics": "Founder of Invonics Technologies — we audit how a business actually works, then refine its systems or build new ones."
  },
  "what": {
    "heading": "Whole systems.",
    "body": "I design and build whole systems — backend, frontend, mobile, and the AI inside them. Backends that move money and survive load, web apps in React and Angular, Android in Kotlin, and AI systems end to end: training my own models locally, integrating LLMs, and building the fine-tuning and RAG pipelines around them.",
    "layers": [
      { "name": "AI", "items": ["PyTorch", "YOLOv8", "LangChain", "ChromaDB", "OpenAI", "Groq", "NumPy"] },
      { "name": "Android", "items": ["Kotlin"] },
      { "name": "Web", "items": ["React", "TypeScript", "Angular", "Tailwind CSS", "Vite"] },
      { "name": "Backend", "items": ["Django", "FastAPI", "Fastify", "Express", "Spring Boot", "Celery", "BullMQ"] },
      { "name": "Data / infra", "items": ["PostgreSQL", "Redis", "Docker", "Railway", "Vercel", "Sentry", "Cloudflare R2"] }
    ]
  },
  "solves": {
    "heading": "Software that has to hold up in real conditions.",
    "items": [
      { "condition": "Thousands of buyers, one ticket tier, no overselling", "proof": ["eventify"] },
      { "condition": "Payments that confirm even when the M-Pesa callback never arrives", "proof": ["eventify"] },
      { "condition": "Classrooms with patchy signal that still work offline", "proof": ["assetflow"] },
      { "condition": "Many schools on one system, each one's data walled off", "proof": ["assetflow"] },
      { "condition": "AI that does real work but leaves the final call to a person", "proof": ["invonics-automations", "invonics-crm"] },
      { "condition": "Answers grounded in your own material, with faithfulness measured", "proof": ["digital-twin"] }
    ]
  },
  "for": {
    "heading": "Who it's for.",
    "sectors": ["Schools and institutions", "Event organisers", "Retailers", "Farmers", "Students and educators", "Sales teams and growing businesses"],
    "tail": "And any team that needs technical depth without a full-time hire."
  }
}
```

`src/content/contact.json`:

```json
{
  "heading": "Write to me.",
  "email": "sydneykamau2005@gmail.com",
  "cvPath": "/Sydney_Kamau_Resume.docx",
  "bookingUrl": null,
  "project": {
    "subject": "Project enquiry",
    "body": "What we're building:\nTimeline:\nBudget range:"
  },
  "links": [
    { "label": "Email", "href": "mailto:sydneykamau2005@gmail.com", "kind": "email" },
    { "label": "GitHub", "href": "https://github.com/surturn", "kind": "github" },
    { "label": "LinkedIn", "href": "https://www.linkedin.com/in/sydney-kamau-991b362a2/", "kind": "linkedin" },
    { "label": "Invonics Technologies", "href": "https://invonicstechnologies.com", "kind": "invonics" }
  ],
  "colophon": "Set in Bodoni Moda, Inter Tight and IBM Plex Mono. Built in Nairobi."
}
```

`src/content/credentials.json`:

```json
[
  { "title": "BSc, Computer Science", "issuer": "Multimedia University of Kenya", "period": "2024 — Present", "note": "Software engineering and AI/ML systems." },
  { "title": "Certificate in Full Stack Development", "issuer": "Emobilis", "period": "2024", "note": "Full-stack programme covering modern web technologies." },
  { "title": "President's Award Kenya", "issuer": "Gold Level — Chairman, Western Region", "period": "Leadership", "note": "Led regional programmes and coordinated multi-team initiatives." },
  { "title": "Quantium", "issuer": "Job simulation", "period": "Training", "note": "Built a data-driven pricing analysis application." },
  { "title": "Datacom", "issuer": "Job simulation", "period": "Training", "note": "Used AI tools for debugging and system design." }
]
```

`src/content/offhours.json`:

```json
{
  "heading": "Off-hours.",
  "items": [
    { "title": "Football", "body": "The original systems game — eleven variables, one objective, endless optimisation." },
    { "title": "FIFA", "body": "Strategy and optimisation don't stop at the keyboard." }
  ]
}
```

- [ ] **Step 9: Write the project files**

Flows are drafts from each README; the owner reviews them in Stage B. Write these eight files exactly.

`src/content/projects/assetflow.md`:

```markdown
---
id: assetflow
name: AssetFlow Schools
status: Beta
tier: featured
order: 1
repo: { url: null, private: true }
liveUrl: https://asset-manager-tan-rho.vercel.app
standfirst: Multi-tenant asset management for Kenyan schools — tracking, borrowing, invoicing, and an assistant you can ask.
problem: "The classroom has no signal. The register still has to balance."
stack: [Django, Django REST Framework, PostgreSQL, React, TypeScript, Celery, Redis]
figure: { src: /images/placeholders/assetflow.svg, alt: AssetFlow dashboard, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Teacher, PWA, Queue, API]
  steps:
    - { from: Teacher, to: PWA, label: "Records a return, offline" }
    - { from: PWA, to: Queue, label: "Write queued, idempotent" }
    - { from: Queue, to: API, label: "Sync attempt, no signal", kind: fail }
    - { from: Queue, to: API, label: "Reconnect: replays in order", kind: recover }
    - { from: API, to: API, label: "Row-level security per school" }
    - { from: API, to: PWA, label: "Damages roll into invoices" }
outcome: Schools keep working through dead zones, and no school can ever see another's data.
---

Every tenant-scoped table is isolated by PostgreSQL row-level security, not just application filters.

- Asset lifecycle with QR tracking and straight-line depreciation
- Borrow, return, and damage invoicing with server-side PDFs
- An assistant that answers from the school's own data first, with an LLM as fallback
```

`src/content/projects/eventify.md`:

```markdown
---
id: eventify
name: Eventify
status: Live
tier: featured
order: 2
repo: { url: https://github.com/surturn/ticketing-app, private: false }
liveUrl: https://ticketing-app-vert.vercel.app
standfirst: Event ticketing and M-Pesa payments for the Kenyan market, built for flash sales.
problem: "The M-Pesa callback never arrived. The ticket still printed."
stack: [Fastify, PostgreSQL, Drizzle ORM, Redis, BullMQ, M-Pesa Daraja]
figure: { src: /images/placeholders/eventify.svg, alt: Eventify checkout, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Buyer, Eventify, M-Pesa, Gate]
  steps:
    - { from: Buyer, to: Eventify, label: "Checkout, seat held" }
    - { from: Eventify, to: M-Pesa, label: "STK push" }
    - { from: M-Pesa, to: Eventify, label: "Callback lost", kind: fail }
    - { from: Eventify, to: M-Pesa, label: "Reconciler asks Daraja directly" }
    - { from: M-Pesa, to: Eventify, label: "Paid", kind: recover }
    - { from: Eventify, to: Buyer, label: "Signed QR ticket" }
    - { from: Gate, to: Gate, label: "Verifies offline, single use" }
outcome: Oversell-safe under flash-sale load, with every state change on an append-only ledger.
---

Inventory moves between available, reserved, and sold in single conditional statements, with a database constraint as the final guarantee.

- Idempotent checkout, so retries on unreliable connections are free
- Automatic reconciliation when a payment callback does not arrive
- Signed QR tickets that verify offline at the gate
```

`src/content/projects/digital-twin.md`:

```markdown
---
id: digital-twin
name: Digital Twin
status: In progress
tier: featured
order: 3
repo: { url: null, private: true }
standfirst: An AI study partner for computer science students that learns how you learn.
problem: "Most AI tutors forget you the moment the chat ends."
stack: [Python, LangChain, Groq, ChromaDB, Streamlit, NumPy]
figure: { src: /images/placeholders/digital-twin.svg, alt: Digital Twin study session, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Student, Twin, Retriever, LLM]
  steps:
    - { from: Student, to: Twin, label: "Asks about deadlocks" }
    - { from: Twin, to: Retriever, label: "Chunk, embed, top-k from the unit" }
    - { from: Retriever, to: Twin, label: "Your lecture slides, cited" }
    - { from: Twin, to: Twin, label: "Old turns folded into a summary" }
    - { from: Twin, to: LLM, label: "Prompt within a token budget" }
    - { from: LLM, to: Student, label: "Grounded answer, faithfulness checked", kind: recover }
outcome: Long sessions that keep their thread, and answers measured against a hand-written question set.
---

The context window is managed to a measured token budget: recent turns stay verbatim, older ones fold into a running summary.

- Retrieval over the student's own course material, stored in a local vector database
- A predictive network written from scratch in NumPy with hand-derived backpropagation — *in progress*
- A semantic map of what the student knows — *in progress*
```

`src/content/projects/farmassist.md`:

```markdown
---
id: farmassist
name: FarmAssist
status: In progress
tier: featured
order: 4
repo: { url: https://github.com/surturn/farm-assist-grow, private: false }
standfirst: An AI farming companion — photograph a leaf, get a diagnosis and what to do next.
problem: "A farmer with one photo and no agronomist nearby."
stack: [React, TypeScript, Express, Prisma, PostgreSQL, Redis, YOLOv8, OpenAI]
figure: { src: /images/placeholders/farmassist.svg, alt: FarmAssist crop diagnosis, width: 1600, height: 1000, placeholder: true }
flow:
  actors: [Farmer, App, Model, Advisor]
  steps:
    - { from: Farmer, to: App, label: "Photo of a sick leaf" }
    - { from: App, to: Model, label: "Custom-trained YOLOv8 detects disease" }
    - { from: Model, to: App, label: "Diagnosis with confidence" }
    - { from: App, to: Advisor, label: "Diagnosis + local weather" }
    - { from: Advisor, to: Farmer, label: "Treatment and timing", kind: recover }
outcome: A model trained on real crop disease data, wrapped in advice a farmer can act on.
---

A monorepo with a feature-driven React frontend and a layered Express and Prisma backend, with Redis for caching and rate limiting.

- Disease detection from a custom-trained YOLOv8 model
- Weather-based recommendations
- A WhatsApp diagnosis channel — *in progress*
```

`src/content/projects/forus.md`:

```markdown
---
id: forus
name: FoRUs
status: In progress
tier: featured
order: 5
repo: { url: null, private: true }
standfirst: A life-planning Android app for one person or a couple — goals across seven horizons, reconciled every night.
problem: "What we do and what we spend rarely match what we say we want."
stack: [Kotlin, Android]
figure: { src: /images/placeholders/forus.svg, alt: FoRUs nightly reconcile screen, width: 1000, height: 1600, placeholder: true }
flow:
  actors: [You, Ritual, Goals, Partner]
  steps:
    - { from: Ritual, to: You, label: "8pm: reconcile today" }
    - { from: You, to: Ritual, label: "Every open task resolved" }
    - { from: Ritual, to: Goals, label: "Tomorrow linked to goals" }
    - { from: Goals, to: You, label: "Order proposed by goal rank" }
    - { from: Goals, to: Partner, label: "Shared by default, or listed only" }
outcome: A daily habit that keeps actions and spending tied to the goals they serve.
---

Goals span day, week, month, quarter, half-year, year, and lifetime; spending is logged against the same goals.

- A nightly ritual that blocks the app until yesterday is reconciled
- Optional pairing, with private, listed, or shared items
```

`src/content/projects/lucklotter.md`:

```markdown
---
id: lucklotter
name: LuckLotter
status: In progress
tier: index
order: 6
repo: { url: https://github.com/surturn/luckylotter, private: false }
standfirst: An AI retention layer that learns each customer's visit rhythm from POS data and wins back regulars who go quiet.
stack: [Spring Boot, Java 21, PostgreSQL, Angular]
---

A Spring Boot and Angular system deployed with Docker Compose.
```

`src/content/projects/invonics-crm.md`:

```markdown
---
id: invonics-crm
name: Invonics CRM
status: Live (internal)
tier: index
order: 7
repo: { url: null, private: true }
standfirst: A sales operations hub where automation creates tasks and reminders — and never messages a prospect on its own.
stack: [Django, PostgreSQL]
---

Every active lead has an owner, a next action, and a date, derived by one rule shared across the app.
```

`src/content/projects/invonics-automations.md`:

```markdown
---
id: invonics-automations
name: Invonics automations
status: Live (internal)
tier: index
order: 8
repo: { url: null, private: true }
standfirst: Scheduled research briefs and email digests that keep a human as the only gate, and keep client mail away from the LLM.
stack: [Python, OpenAI, Railway]
---

Two independent automations deployed as scheduled Railway jobs.
```

- [ ] **Step 10: Run the loader tests**

Run: `npx vitest run src/__tests__/content/loadContent.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 11: Verify the plugin in a real build**

Run: `npx vite build`
Expected: build succeeds. Then introduce a typo (`"eventify"` → `"evntify"` in `profile.json` cover chips), re-run, and confirm the build fails with a message naming `profile.json` and `evntify`. Revert the typo.

- [ ] **Step 12: Commit**

```bash
git rm src/__tests__/content/content.test.ts
git add src/content vite scripts public/images vite.config.ts vitest.config.ts tsconfig.node.json src/__tests__/content
git commit -m "feat: move content to validated Markdown/JSON files behind a build-time plugin"
```

---

### Task 4: Film registry and discrete store

**Files:**
- Create: `src/film/registry.ts`, `src/film/store.ts`
- Create: `src/__tests__/film/registry.test.ts`, `src/__tests__/film/store.test.ts`

**Interfaces:**
- Produces (`registry.ts`):
  - `type Chapter = 'cover' | 'profile' | 'work' | 'contact'`
  - `interface ShotDef { id: string; chapter: Chapter; length: number; hold: [number, number] }`
  - `interface PlacedShot extends ShotDef { start: number; end: number; holdStart: number; holdEnd: number }` — all in master progress 0..1
  - `validateShots(shots: ShotDef[]): void` — throws `Error` on duplicate id, `length <= 0`, hold outside `[0,1]`, or `hold[0] >= hold[1]`
  - `placeShots(shots: ShotDef[]): { placed: PlacedShot[]; total: number }` — `total` is the sum of lengths (viewport-heights)
  - `shotAt(placed: PlacedShot[], progress: number): PlacedShot`
  - `scrollYFor(progress: number, spacerTop: number, spacerHeight: number, viewport: number): number`
- Produces (`store.ts`):
  - `type Mode = 'film' | 'article'`; `type ModeReason = 'default' | 'toggle' | 'reduced-motion' | 'save-data'`; `type ReelState = 'pending' | 'playing' | 'paused' | 'done'`
  - `resolveMode(env: { reducedMotion: boolean; saveData: boolean; stored: Mode | null }): { mode: Mode; reason: ModeReason }`
  - `readStored(key: string): string | null`, `writeStored(key: string, value: string, session?: boolean): void` — never throw
  - `MODE_KEY = 'film-mode'`, `REEL_KEY = 'reel-seen'`
  - `useFilmStore` with `{ activeShot: string; mode: Mode; modeReason: ModeReason; reelState: ReelState; setActiveShot(id: string): void; setMode(mode: Mode, reason: ModeReason): void; setReelState(s: ReelState): void }`

- [ ] **Step 1: Write the registry test**

Create `src/__tests__/film/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { placeShots, shotAt, validateShots, scrollYFor, type ShotDef } from '@/film/registry'

const shots: ShotDef[] = [
  { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] },
  { id: 'b', chapter: 'profile', length: 3, hold: [0.4, 0.8] },
]

describe('registry', () => {
  it('places shots end to end in master progress', () => {
    const { placed, total } = placeShots(shots)
    expect(total).toBe(4)
    expect(placed[0]).toMatchObject({ start: 0, end: 0.25, holdStart: 0, holdEnd: 0.125 })
    expect(placed[1].start).toBeCloseTo(0.25)
    expect(placed[1].end).toBeCloseTo(1)
    expect(placed[1].holdStart).toBeCloseTo(0.25 + 0.4 * 0.75)
  })

  it('finds the shot containing a progress value, with 1 mapping to the last', () => {
    const { placed } = placeShots(shots)
    expect(shotAt(placed, 0).id).toBe('a')
    expect(shotAt(placed, 0.2499).id).toBe('a')
    expect(shotAt(placed, 0.25).id).toBe('b')
    expect(shotAt(placed, 1).id).toBe('b')
    expect(shotAt(placed, -0.1).id).toBe('a')
    expect(shotAt(placed, 1.4).id).toBe('b')
  })

  it.each([
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] }, { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] }], /duplicate/],
    [[{ id: 'a', chapter: 'cover', length: 0, hold: [0, 0.5] }], /length/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0.6, 0.5] }], /hold/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [-0.1, 0.5] }], /hold/],
    [[{ id: 'a', chapter: 'cover', length: 1, hold: [0.2, 1.2] }], /hold/],
  ])('rejects invalid shot lists', (list, msg) => {
    expect(() => validateShots(list as ShotDef[])).toThrow(msg)
  })

  it('maps progress to a scroll position inside the spacer', () => {
    expect(scrollYFor(0, 100, 5000, 1000)).toBe(100)
    expect(scrollYFor(1, 100, 5000, 1000)).toBe(4100)
    expect(scrollYFor(0.5, 100, 5000, 1000)).toBe(2100)
  })
})
```

- [ ] **Step 2: Write the store test**

Create `src/__tests__/film/store.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolveMode, readStored, writeStored, useFilmStore } from '@/film/store'

afterEach(() => vi.restoreAllMocks())

describe('resolveMode', () => {
  it('defaults to film', () => {
    expect(resolveMode({ reducedMotion: false, saveData: false, stored: null })).toEqual({ mode: 'film', reason: 'default' })
  })
  it('honours reduced motion', () => {
    expect(resolveMode({ reducedMotion: true, saveData: false, stored: null })).toEqual({ mode: 'article', reason: 'reduced-motion' })
  })
  it('honours Save-Data', () => {
    expect(resolveMode({ reducedMotion: false, saveData: true, stored: null })).toEqual({ mode: 'article', reason: 'save-data' })
  })
  it('lets an explicit choice win over environment', () => {
    expect(resolveMode({ reducedMotion: true, saveData: false, stored: 'film' })).toEqual({ mode: 'film', reason: 'toggle' })
    expect(resolveMode({ reducedMotion: false, saveData: false, stored: 'article' })).toEqual({ mode: 'article', reason: 'toggle' })
  })
})

describe('storage helpers', () => {
  it('return null and do not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(readStored('x')).toBeNull()
    expect(() => writeStored('x', '1')).not.toThrow()
    expect(() => writeStored('x', '1', true)).not.toThrow()
  })
})

describe('useFilmStore', () => {
  it('does not notify when the active shot is unchanged', () => {
    const listener = vi.fn()
    const unsub = useFilmStore.subscribe(listener)
    const current = useFilmStore.getState().activeShot
    useFilmStore.getState().setActiveShot(current)
    expect(listener).not.toHaveBeenCalled()
    unsub()
  })
})
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx vitest run src/__tests__/film`
Expected: FAIL — cannot resolve `@/film/registry`.

- [ ] **Step 4: Implement the registry**

Create `src/film/registry.ts`:

```ts
export type Chapter = 'cover' | 'profile' | 'work' | 'contact';

export interface ShotDef {
  id: string;
  chapter: Chapter;
  /** Scroll length in viewport-heights. */
  length: number;
  /** Fraction window [0..1] of the shot during which nothing moves. */
  hold: [number, number];
}

export interface PlacedShot extends ShotDef {
  start: number;
  end: number;
  holdStart: number;
  holdEnd: number;
}

export function validateShots(shots: ShotDef[]): void {
  const seen = new Set<string>();
  for (const s of shots) {
    if (seen.has(s.id)) throw new Error(`duplicate shot id "${s.id}"`);
    seen.add(s.id);
    if (!(s.length > 0)) throw new Error(`shot "${s.id}": length must be > 0`);
    const [a, b] = s.hold;
    if (a < 0 || b > 1 || a >= b) throw new Error(`shot "${s.id}": hold must satisfy 0 <= start < end <= 1`);
  }
}

export function placeShots(shots: ShotDef[]): { placed: PlacedShot[]; total: number } {
  validateShots(shots);
  const total = shots.reduce((sum, s) => sum + s.length, 0);
  let cursor = 0;
  const placed = shots.map((s) => {
    const start = cursor / total;
    cursor += s.length;
    const end = cursor / total;
    const span = end - start;
    return { ...s, start, end, holdStart: start + s.hold[0] * span, holdEnd: start + s.hold[1] * span };
  });
  return { placed, total };
}

export function shotAt(placed: PlacedShot[], progress: number): PlacedShot {
  const p = Math.min(1, Math.max(0, progress));
  return placed.find((s) => p >= s.start && p < s.end) ?? placed[placed.length - 1];
}

export function scrollYFor(progress: number, spacerTop: number, spacerHeight: number, viewport: number): number {
  return spacerTop + progress * Math.max(0, spacerHeight - viewport);
}
```

- [ ] **Step 5: Implement the store**

Create `src/film/store.ts`:

```ts
import { create } from 'zustand';

export type Mode = 'film' | 'article';
export type ModeReason = 'default' | 'toggle' | 'reduced-motion' | 'save-data';
export type ReelState = 'pending' | 'playing' | 'paused' | 'done';

export const MODE_KEY = 'film-mode';
export const REEL_KEY = 'reel-seen';

export function readStored(key: string, session = false): string | null {
  try {
    return (session ? window.sessionStorage : window.localStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string, session = false): void {
  try {
    (session ? window.sessionStorage : window.localStorage).setItem(key, value);
  } catch {
    /* storage unavailable: the choice simply is not remembered */
  }
}

export function resolveMode(env: { reducedMotion: boolean; saveData: boolean; stored: Mode | null }): {
  mode: Mode;
  reason: ModeReason;
} {
  if (env.stored) return { mode: env.stored, reason: 'toggle' };
  if (env.reducedMotion) return { mode: 'article', reason: 'reduced-motion' };
  if (env.saveData) return { mode: 'article', reason: 'save-data' };
  return { mode: 'film', reason: 'default' };
}

interface FilmState {
  activeShot: string;
  mode: Mode;
  modeReason: ModeReason;
  reelState: ReelState;
  setActiveShot: (id: string) => void;
  setMode: (mode: Mode, reason: ModeReason) => void;
  setReelState: (s: ReelState) => void;
}

/**
 * Resolve the mode before the first render, so reduced-motion visitors never
 * get a frame of the film engine. useModeBootstrap re-resolves on change.
 */
function initialMode(): { mode: Mode; reason: ModeReason } {
  if (typeof window === 'undefined' || !window.matchMedia) return { mode: 'film', reason: 'default' };
  const stored = readStored(MODE_KEY);
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return resolveMode({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: conn?.saveData === true,
    stored: stored === 'film' || stored === 'article' ? stored : null,
  });
}

const boot = initialMode();

/** DISCRETE STATE ONLY. Nothing here changes per frame. */
export const useFilmStore = create<FilmState>((set, get) => ({
  activeShot: 'cover',
  mode: boot.mode,
  modeReason: boot.reason,
  reelState: 'pending',
  setActiveShot: (id) => {
    if (get().activeShot !== id) set({ activeShot: id });
  },
  setMode: (mode, reason) => set({ mode, modeReason: reason }),
  setReelState: (reelState) => set({ reelState }),
}));
```

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/__tests__/film`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/film src/__tests__/film
git commit -m "feat: add the film registry and discrete film store"
```

---

### Task 5: Film engine, Stage, and Shot

**Files:**
- Create: `src/film/engine.ts`, `src/film/useFilm.ts`, `src/film/Stage.tsx`, `src/film/Shot.tsx`, `src/film/useModeBootstrap.ts`
- Modify: `src/lib/scrollStore.ts` (reduced to `scrollState`)
- Replace: `src/__tests__/lib/scrollStore.test.ts`
- Create: `src/__tests__/film/Stage.test.tsx`

**Interfaces:**
- Consumes: `placeShots`, `shotAt`, `ShotDef`, `PlacedShot` (Task 4); `useFilmStore`, `resolveMode`, `readStored`, `MODE_KEY` (Task 4).
- Produces:
  - `scrollState: { progress: number; velocity: number }` (`lib/scrollStore.ts`)
  - `type ShotBuild = (tl: gsap.core.Timeline, root: HTMLElement, shot: PlacedShot) => void`
  - `interface ShotModule { def: ShotDef; Component: () => JSX.Element; build?: ShotBuild }`
  - `engine: { lenis: Lenis | null; placed: PlacedShot[]; spacer: HTMLElement | null }` (`film/engine.ts`)
  - `useFilm(spacerRef, stageRef, shots: ShotModule[], enabled: boolean): void`
  - `<Stage shots={ShotModule[]} />`
  - `<Shot def={ShotDef} className?: string>{children}</Shot>` — renders `<section id="shot-<id>" data-shot="<id>" data-chapter aria-labelledby="shot-<id>-title">`; children must render an element with `id="shot-<id>-title"`
  - `useModeBootstrap(): void` — resolves mode once on mount from media queries + storage

- [ ] **Step 1: Write the Stage test**

Create `src/__tests__/film/Stage.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Stage } from '@/film/Stage'
import { Shot } from '@/film/Shot'
import { useFilmStore } from '@/film/store'
import type { ShotModule } from '@/film/useFilm'

const make = (id: string, chapter: 'cover' | 'profile'): ShotModule => ({
  def: { id, chapter, length: 1, hold: [0.2, 0.8] },
  Component: () => (
    <Shot def={{ id, chapter, length: 1, hold: [0.2, 0.8] }}>
      <h2 id={`shot-${id}-title`}>{id} title</h2>
      <a href="#x">{id} link</a>
    </Shot>
  ),
})

const shots = [make('one', 'cover'), make('two', 'profile')]

beforeEach(() => {
  useFilmStore.setState({ activeShot: 'one', mode: 'film', modeReason: 'default', reelState: 'done' })
})

describe('Stage', () => {
  it('renders every shot as a labelled section in order', () => {
    const { container } = render(<Stage shots={shots} />)
    const ids = [...container.querySelectorAll('[data-shot]')].map((el) => el.getAttribute('data-shot'))
    expect(ids).toEqual(['one', 'two'])
    expect(screen.getByRole('region', { name: 'one title' })).toBeInTheDocument()
  })

  it('makes inactive shots inert in film mode', () => {
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelector('[data-shot="one"]')).not.toHaveAttribute('inert')
    expect(container.querySelector('[data-shot="two"]')).toHaveAttribute('inert')
    act(() => useFilmStore.getState().setActiveShot('two'))
    expect(container.querySelector('[data-shot="one"]')).toHaveAttribute('inert')
    expect(container.querySelector('[data-shot="two"]')).not.toHaveAttribute('inert')
  })

  it('makes nothing inert in article mode and drops the spacer height', () => {
    useFilmStore.setState({ mode: 'article' })
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelectorAll('[inert]')).toHaveLength(0)
    expect(container.querySelector('[data-film-spacer]')).toHaveAttribute('data-mode', 'article')
    expect(screen.getByRole('link', { name: 'two link' })).toBeInTheDocument()
  })

  it('sizes the spacer to the summed shot lengths in film mode', () => {
    const { container } = render(<Stage shots={shots} />)
    // jsdom's CSS parser drops svh units, so assert the length attribute the style is derived from.
    expect(container.querySelector('[data-film-spacer]')).toHaveAttribute('data-length', '2')
  })

  it('tears down cleanly when unmounted and remounted (StrictMode-safe)', () => {
    const first = render(<Stage shots={shots} />)
    first.unmount()
    const { container } = render(<Stage shots={shots} />)
    expect(container.querySelectorAll('[data-shot]')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Replace the scroll-store test**

Replace `src/__tests__/lib/scrollStore.test.ts` with:

```ts
import { describe, it, expect } from 'vitest'
import { scrollState } from '@/lib/scrollStore'

describe('scrollState', () => {
  it('is a plain mutable object, not reactive state', () => {
    expect(scrollState).toEqual({ progress: 0, velocity: 0 })
    scrollState.progress = 0.5
    expect(scrollState.progress).toBe(0.5)
    scrollState.progress = 0
  })
})
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx vitest run src/__tests__/film/Stage.test.tsx src/__tests__/lib/scrollStore.test.ts`
Expected: FAIL — cannot resolve `@/film/Stage`; `scrollState` has extra `scenes` key.

- [ ] **Step 4: Reduce `src/lib/scrollStore.ts`**

Replace the file with:

```ts
/**
 * CONTINUOUS SCROLL STATE — a plain mutable object, deliberately NOT React
 * state. The film engine writes it once per frame; anything that needs it
 * reads it imperatively. If this were reactive, every subscriber would
 * re-render 60 times a second.
 */
export const scrollState: { progress: number; velocity: number } = {
  progress: 0,
  velocity: 0,
};
```

- [ ] **Step 5: Write the engine handle**

Create `src/film/engine.ts`:

```ts
import type Lenis from 'lenis';
import type { PlacedShot } from './registry';

/** Live handles the seek helper needs. Written by useFilm, read by seek. */
export const engine: { lenis: Lenis | null; placed: PlacedShot[]; spacer: HTMLElement | null } = {
  lenis: null,
  placed: [],
  spacer: null,
};
```

- [ ] **Step 6: Write `useFilm`**

Create `src/film/useFilm.ts`:

```ts
import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { placeShots, shotAt, type PlacedShot, type ShotDef } from './registry';
import { useFilmStore } from './store';
import { engine } from './engine';
import { scrollState } from '@/lib/scrollStore';

export type ShotBuild = (tl: gsap.core.Timeline, root: HTMLElement, shot: PlacedShot) => void;

export interface ShotModule {
  def: ShotDef;
  Component: () => JSX.Element;
  build?: ShotBuild;
}

gsap.registerPlugin(ScrollTrigger);

/**
 * Builds the film: Lenis smooths native scroll, ScrollTrigger maps the
 * spacer's scroll range onto one master timeline made of each shot's
 * sub-timeline. Everything is created inside a gsap.context and reverted on
 * cleanup, so remounts (StrictMode, HMR, mode toggles) never stack triggers.
 */
export function useFilm(
  spacerRef: RefObject<HTMLElement>,
  stageRef: RefObject<HTMLElement>,
  shots: ShotModule[],
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    const spacer = spacerRef.current;
    const stage = stageRef.current;
    const { placed, total } = placeShots(shots.map((s) => s.def));
    engine.placed = placed;
    engine.spacer = spacer;
    if (!enabled || !spacer || !stage) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    engine.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const setActive = useFilmStore.getState().setActiveShot;
    let lastY = window.scrollY;

    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
      placed.forEach((shot, i) => {
        const root = stage.querySelector<HTMLElement>(`[data-shot="${shot.id}"]`);
        if (!root) return;
        const sub = gsap.timeline();
        if (i > 0) sub.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: Math.min(0.3, shot.hold[0] * shot.length) }, 0);
        shots[i].build?.(sub, root, shot);
        if (i < placed.length - 1) {
          const out = Math.min(0.3, (1 - shot.hold[1]) * shot.length);
          sub.to(root, { autoAlpha: 0, duration: out }, shot.length - out);
        }
        sub.set({}, {}, shot.length);
        master.add(sub, shot.start * total);
      });

      ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: 'bottom bottom',
        animation: master,
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          scrollState.velocity = window.scrollY - lastY;
          lastY = window.scrollY;
          setActive(shotAt(placed, self.progress).id);
        },
      });
    }, stage);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      engine.lenis = null;
    };
  }, [spacerRef, stageRef, shots, enabled]);
}
```

- [ ] **Step 7: Write `Shot`**

Create `src/film/Shot.tsx`:

```tsx
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { ShotDef } from './registry';
import { useFilmStore } from './store';

/**
 * One shot. In film mode every shot is stacked on the stage and only the
 * active one is reachable: the rest are inert (no focus, hidden from AT).
 * In article mode shots are ordinary sections in document order.
 */
export function Shot({ def, className = '', children }: { def: ShotDef; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const hidden = useFilmStore((s) => s.mode === 'film' && s.activeShot !== def.id);

  useLayoutEffect(() => {
    // React 18 does not forward `inert` reliably; set it directly.
    ref.current?.toggleAttribute('inert', hidden);
  }, [hidden]);

  return (
    <section
      ref={ref}
      id={`shot-${def.id}`}
      data-shot={def.id}
      data-chapter={def.chapter}
      aria-labelledby={`shot-${def.id}-title`}
      className={`film-shot ${className}`}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 8: Write `Stage` and its CSS**

Create `src/film/Stage.tsx`:

```tsx
import { useMemo, useRef } from 'react';
import { useFilm, type ShotModule } from './useFilm';
import { useFilmStore } from './store';

/**
 * The film. In film mode a tall spacer provides the scroll range and the
 * stage sticks to the viewport inside it. In article mode the spacer has no
 * fixed height and shots flow as a normal document.
 */
export function Stage({ shots }: { shots: ShotModule[] }) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mode = useFilmStore((s) => s.mode);
  const film = mode === 'film';
  const total = useMemo(() => shots.reduce((sum, s) => sum + s.def.length, 0), [shots]);

  useFilm(spacerRef, stageRef, shots, film);

  return (
    <div
      ref={spacerRef}
      data-film-spacer
      data-mode={mode}
      data-length={total}
      style={film ? { height: `calc(${total * 100} * 1svh)` } : undefined}
    >
      <div ref={stageRef} className="film-stage">
        {shots.map(({ def, Component }) => (
          <Component key={def.id} />
        ))}
      </div>
    </div>
  );
}
```

Append to `src/index.css` inside `@layer components`:

```css
  [data-film-spacer][data-mode='film'] .film-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
  [data-film-spacer][data-mode='film'] .film-shot {
    position: absolute;
    inset: 0;
    visibility: hidden;
  }
  [data-film-spacer][data-mode='film'] .film-shot:first-child {
    visibility: visible;
  }
  [data-film-spacer][data-mode='article'] .film-shot {
    position: relative;
    padding-block: 6rem;
  }
  @media (max-width: 767px) {
    [data-film-spacer][data-mode='article'] .film-shot {
      padding-block: 4rem;
    }
  }
```

GSAP's `autoAlpha` sets `visibility: visible` inline on each shot as it enters, which overrides the stylesheet default.

- [ ] **Step 9: Write the mode bootstrap**

Create `src/film/useModeBootstrap.ts`:

```ts
import { useLayoutEffect } from 'react';
import { usePrefersReducedMotion } from '@/lib/useMediaQuery';
import { MODE_KEY, readStored, resolveMode, useFilmStore, type Mode } from './store';

/** Resolves film vs article once per environment change. */
export function useModeBootstrap(): void {
  const reducedMotion = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const stored = readStored(MODE_KEY);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const { mode, reason } = resolveMode({
      reducedMotion,
      saveData: conn?.saveData === true,
      stored: stored === 'film' || stored === 'article' ? (stored as Mode) : null,
    });
    useFilmStore.getState().setMode(mode, reason);
  }, [reducedMotion]);
}
```

- [ ] **Step 10: Run the tests**

Run: `npx vitest run src/__tests__/film src/__tests__/lib`
Expected: PASS. If ScrollTrigger throws in jsdom during the film-mode tests, add at the top of `Stage.test.tsx`:

```ts
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn(), update: vi.fn() } }))
```

(with `vi` imported from `vitest`) and note it in the commit message.

- [ ] **Step 11: Commit**

```bash
git add src/film src/lib/scrollStore.ts src/index.css src/__tests__/film src/__tests__/lib/scrollStore.test.ts
git commit -m "feat: add the film engine, sticky stage, and inert-aware shots"
```

---

### Task 6: Seek and chrome

**Files:**
- Create: `src/film/seek.ts`, `src/chrome/ChapterBar.tsx`, `src/chrome/ModeToggle.tsx`, `src/chrome/SkipLink.tsx`
- Create: `src/__tests__/film/seek.test.ts`, `src/__tests__/chrome/chrome.test.tsx`

**Interfaces:**
- Consumes: `engine` (Task 5), `scrollYFor`, `Chapter` (Task 4), `useFilmStore`, `writeStored`, `MODE_KEY` (Task 4), `content.site.chapters` (Task 3).
- Produces:
  - `seekToShot(id: string, fallback?: string): boolean` — true if it scrolled; tries `id`, then `fallback`
  - `<ChapterBar />` — `<header>` with `nav[aria-label="Chapters"]`, the Work-with-me CTA, and `<ModeToggle />`
  - `<ModeToggle />`, `<SkipLink />`

- [ ] **Step 1: Write the seek test**

Create `src/__tests__/film/seek.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { seekToShot } from '@/film/seek'
import { engine } from '@/film/engine'
import { placeShots } from '@/film/registry'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  document.body.innerHTML = `
    <div data-film-spacer></div>
    <section id="shot-a"><h2 id="shot-a-title" tabindex="-1">A</h2></section>
    <section id="shot-b"><h2 id="shot-b-title" tabindex="-1">B</h2></section>`
  engine.placed = placeShots([
    { id: 'a', chapter: 'cover', length: 1, hold: [0, 0.5] },
    { id: 'b', chapter: 'contact', length: 1, hold: [0.5, 1] },
  ]).placed
  engine.spacer = document.querySelector('[data-film-spacer]')
  engine.lenis = null
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Element.prototype.scrollIntoView = vi.fn()
})

describe('seekToShot', () => {
  it('in film mode, scrolls to the shot hold start through Lenis when present', () => {
    useFilmStore.setState({ mode: 'film' })
    const scrollTo = vi.fn()
    engine.lenis = { scrollTo } as never
    expect(seekToShot('b')).toBe(true)
    expect(scrollTo).toHaveBeenCalledWith(expect.any(Number), expect.objectContaining({ duration: expect.any(Number) }))
  })

  it('in article mode, scrolls the section into view', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('b')).toBe(true)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('moves focus to the shot title', () => {
    useFilmStore.setState({ mode: 'article' })
    seekToShot('b')
    expect(document.activeElement?.id).toBe('shot-b-title')
  })

  it('falls back when the target shot does not exist', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('project-eventify', 'b')).toBe(true)
    expect(document.activeElement?.id).toBe('shot-b-title')
  })

  it('returns false without throwing when neither shot exists', () => {
    useFilmStore.setState({ mode: 'article' })
    expect(seekToShot('nope', 'also-nope')).toBe(false)
  })
})
```

- [ ] **Step 2: Write the chrome test**

Create `src/__tests__/chrome/chrome.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChapterBar } from '@/chrome/ChapterBar'
import { SkipLink } from '@/chrome/SkipLink'
import { useFilmStore } from '@/film/store'
import { engine } from '@/film/engine'
import { placeShots } from '@/film/registry'

beforeEach(() => {
  engine.placed = placeShots([
    { id: 'cover', chapter: 'cover', length: 1, hold: [0, 0.5] },
    { id: 'who', chapter: 'profile', length: 1, hold: [0.3, 0.7] },
    { id: 'back-cover', chapter: 'contact', length: 1, hold: [0.4, 1] },
  ]).placed
  useFilmStore.setState({ activeShot: 'who', mode: 'film', reelState: 'done' })
})

describe('ChapterBar', () => {
  it('lists only chapters that have shots, marking the current one', () => {
    render(<ChapterBar />)
    const nav = screen.getByRole('navigation', { name: 'Chapters' })
    const buttons = [...nav.querySelectorAll('button')].map((b) => b.textContent)
    expect(buttons).toEqual(['Cover', 'Profile', 'Contact'])
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'step')
  })

  it('offers Work with me and the mode toggle', () => {
    render(<ChapterBar />)
    expect(screen.getByRole('button', { name: /work with me/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /read as article/i })).toBeInTheDocument()
  })

  it('toggles to article mode and remembers it', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    render(<ChapterBar />)
    fireEvent.click(screen.getByRole('button', { name: /read as article/i }))
    expect(useFilmStore.getState().mode).toBe('article')
    expect(setItem).toHaveBeenCalledWith('film-mode', 'article')
    expect(screen.getByRole('button', { name: /watch as film/i })).toBeInTheDocument()
  })

  it('meets the 24px target size on every control', () => {
    render(<ChapterBar />)
    for (const b of screen.getAllByRole('button')) {
      expect(b.className).toMatch(/min-h-\[(24|28|44)px\]|btn-signal/)
    }
  })
})

describe('SkipLink', () => {
  it('is a link to the contact shot', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: /skip to contact/i })).toHaveAttribute('href', '#shot-back-cover')
  })
})
```

- [ ] **Step 3: Run them to see them fail**

Run: `npx vitest run src/__tests__/film/seek.test.ts src/__tests__/chrome`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement seek**

Create `src/film/seek.ts`:

```ts
import { engine } from './engine';
import { scrollYFor } from './registry';
import { useFilmStore } from './store';

function focusTitle(id: string) {
  const title = document.getElementById(`shot-${id}-title`);
  title?.focus({ preventScroll: true });
}

function seekOne(id: string): boolean {
  const section = document.getElementById(`shot-${id}`);
  if (!section) return false;
  const film = useFilmStore.getState().mode === 'film';
  const shot = engine.placed.find((s) => s.id === id);

  if (film && shot && engine.spacer) {
    const rect = engine.spacer.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const y = scrollYFor(shot.holdStart, top, engine.spacer.offsetHeight, window.innerHeight) + 1;
    if (engine.lenis) engine.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
    useFilmStore.getState().setActiveShot(id);
  } else {
    section.scrollIntoView({ block: 'start' });
  }
  focusTitle(id);
  return true;
}

/**
 * Scrolls to a shot's hold window and moves focus to its title. Tries
 * `fallback` when `id` is not on the page (e.g. a project shot that has not
 * been built yet). Returns whether anything happened.
 */
export function seekToShot(id: string, fallback?: string): boolean {
  if (seekOne(id)) return true;
  return fallback ? seekOne(fallback) : false;
}
```

The `+ 1` lands one pixel inside the hold so rounding can never leave the playhead on the previous shot.

- [ ] **Step 5: Implement the chrome**

Create `src/chrome/ModeToggle.tsx`:

```tsx
import { MODE_KEY, useFilmStore, writeStored } from '@/film/store';

export function ModeToggle() {
  const mode = useFilmStore((s) => s.mode);
  const next = mode === 'film' ? 'article' : 'film';
  return (
    <button
      type="button"
      className="meta min-h-[28px] px-2 text-ink hover:text-cobalt"
      onClick={() => {
        writeStored(MODE_KEY, next);
        useFilmStore.getState().setMode(next, 'toggle');
        window.scrollTo({ top: 0 });
      }}
    >
      {mode === 'film' ? 'Read as article' : 'Watch as film'}
    </button>
  );
}
```

Create `src/chrome/SkipLink.tsx`:

```tsx
import { seekToShot } from '@/film/seek';

export function SkipLink() {
  return (
    <a
      href="#shot-back-cover"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-4 focus:py-2"
      onClick={(e) => {
        if (seekToShot('back-cover')) e.preventDefault();
      }}
    >
      Skip to contact
    </a>
  );
}
```

Create `src/chrome/ChapterBar.tsx`:

```tsx
import { content } from '@/content';
import { engine } from '@/film/engine';
import type { Chapter } from '@/film/registry';
import { seekToShot } from '@/film/seek';
import { useFilmStore } from '@/film/store';
import { ModeToggle } from './ModeToggle';

const ORDER: Chapter[] = ['cover', 'profile', 'work', 'contact'];

export function ChapterBar() {
  const activeShot = useFilmStore((s) => s.activeShot);
  const current = engine.placed.find((s) => s.id === activeShot)?.chapter;
  const chapters = ORDER.filter((c) => engine.placed.some((s) => s.chapter === c));

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-ink/15 bg-paper/90 px-4 md:px-8"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <nav aria-label="Chapters" className="flex items-center gap-1 overflow-x-auto py-2">
        {chapters.map((c) => (
          <button
            key={c}
            type="button"
            aria-current={current === c ? 'step' : undefined}
            className={`meta min-h-[28px] px-2 ${current === c ? 'bg-ink text-paper' : 'hover:text-cobalt'}`}
            onClick={() => {
              const first = engine.placed.find((s) => s.chapter === c);
              if (first) seekToShot(first.id);
            }}
          >
            {content.site.chapters[c]}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 py-2">
        <ModeToggle />
        <button type="button" className="btn-signal min-h-[44px] text-sm" onClick={() => seekToShot('back-cover')}>
          Work with me
        </button>
      </div>
    </header>
  );
}
```

The chapter bar sits at the top; shots reserve `pt-20` so the bar never covers a focused element (WCAG 2.4.11).

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/__tests__/film/seek.test.ts src/__tests__/chrome`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/film/seek.ts src/chrome src/__tests__/film/seek.test.ts src/__tests__/chrome
git commit -m "feat: add shot seeking with fallback, chapter bar, mode toggle and skip link"
```

---

### Task 7: The cold-open reel

**Files:**
- Create: `src/film/Reel.tsx`, `src/chrome/ReelControls.tsx`, `src/film/reelTimeline.ts`
- Create: `src/__tests__/film/Reel.test.tsx`

**Interfaces:**
- Consumes: `useFilmStore` (`reelState`, `mode`, `setReelState`), `readStored`, `writeStored`, `REEL_KEY` (Task 4).
- Produces:
  - `shouldPlayReel(mode: Mode): boolean` — false in article mode or when the session flag is set
  - `buildReel(overlay: HTMLElement, cover: HTMLElement | null): gsap.core.Timeline` — the ~8.5s timeline; targets `[data-reel="stripe"|"word"|"flowline"|"wipe"]` inside the overlay and `[data-reel="masthead"|"letter"|"portrait"|"standfirst"|"chip"|"cta"]` inside the cover shot
  - `<Reel />` — overlay + controls; renders nothing when not playing
  - `<ReelControls onSkip onToggle playing />`

- [ ] **Step 1: Write the reel test**

Create `src/__tests__/film/Reel.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Reel, shouldPlayReel } from '@/film/Reel'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  sessionStorage.clear()
  useFilmStore.setState({ mode: 'film', reelState: 'pending', activeShot: 'cover' })
})

describe('shouldPlayReel', () => {
  it('plays in film mode on first visit only', () => {
    expect(shouldPlayReel('film')).toBe(true)
    sessionStorage.setItem('reel-seen', '1')
    expect(shouldPlayReel('film')).toBe(false)
  })
  it('never plays in article mode', () => {
    expect(shouldPlayReel('article')).toBe(false)
  })
  it('plays (rather than throwing) when session storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(shouldPlayReel('film')).toBe(true)
    vi.restoreAllMocks()
  })
})

describe('Reel', () => {
  it('puts Skip first, then Pause, both keyboard reachable', () => {
    render(<Reel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAccessibleName(/skip intro/i)
    expect(buttons[1]).toHaveAccessibleName(/pause/i)
  })

  it('Skip ends the reel and sets the session flag', () => {
    render(<Reel />)
    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    expect(useFilmStore.getState().reelState).toBe('done')
    expect(sessionStorage.getItem('reel-seen')).toBe('1')
  })

  it.each([
    ['wheel', () => fireEvent.wheel(window)],
    ['touchmove', () => fireEvent.touchMove(window)],
    ['keydown', () => fireEvent.keyDown(window, { key: 'ArrowDown' })],
  ])('any %s during the reel ends it instead of blocking scroll', (_name, fire) => {
    render(<Reel />)
    act(() => fire())
    expect(useFilmStore.getState().reelState).toBe('done')
  })

  it('Tab reaches the controls without ending the reel', () => {
    render(<Reel />)
    act(() => { fireEvent.keyDown(window, { key: 'Tab' }) })
    expect(useFilmStore.getState().reelState).toBe('playing')
  })

  it('Pause toggles to Play', () => {
    render(<Reel />)
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(useFilmStore.getState().reelState).toBe('paused')
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('renders nothing in article mode', () => {
    useFilmStore.setState({ mode: 'article' })
    const { container } = render(<Reel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('is decorative to assistive tech apart from its controls', () => {
    const { container } = render(<Reel />)
    expect(container.querySelector('[data-reel-overlay]')).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/__tests__/film/Reel.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the timeline**

Create `src/film/reelTimeline.ts`:

```ts
import gsap from 'gsap';

/**
 * The cold open, ~8.5s. Overlay beats run on a constant ink ground; words
 * slide through rather than cutting, so no large area alternates luminance
 * (WCAG 2.3.1). The cover's own elements are revealed from 3.5s onward, so
 * skipping (progress(1)) always leaves the cover at rest.
 */
export function buildReel(overlay: HTMLElement, cover: HTMLElement | null): gsap.core.Timeline {
  const q = gsap.utils.selector(overlay);
  const c = cover ? gsap.utils.selector(cover) : () => [];
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(q('[data-reel="stripe"]'), { xPercent: -120, skewX: -20 }, { xPercent: 120, skewX: -20, duration: 0.8, stagger: 0.08, ease: 'power2.inOut' }, 0);

  q('[data-reel="word"]').forEach((word, i) => {
    const at = 0.8 + i * 0.25;
    tl.fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.14 }, at)
      .to(word, { yPercent: -110, duration: 0.14, ease: 'power3.in' }, at + 0.14);
  });

  tl.fromTo(q('[data-reel="flowline"] path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, 2.0)
    .to(q('[data-reel="break"]'), { autoAlpha: 1, duration: 0.05 }, 2.6)
    .to(q('[data-reel="break"]'), { autoAlpha: 0, duration: 0.05 }, 2.95)
    .to(q('[data-reel="mend"]'), { autoAlpha: 1, duration: 0.2 }, 3.0);

  tl.fromTo(q('[data-reel="wipe"]'), { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 0.9, ease: 'power2.inOut' }, 3.5)
    .set(overlay, { autoAlpha: 0 }, 4.4);

  tl.from(c('[data-reel="masthead"]'), { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, 3.7)
    .from(c('[data-reel="letter"]'), { yPercent: 100, autoAlpha: 0, duration: 0.5, stagger: 0.12 }, 5.0)
    .from(c('[data-reel="portrait"]'), { clipPath: 'inset(100% 0 0 0)', duration: 1.0, ease: 'power2.out' }, 5.6)
    .from(c('[data-reel="standfirst"]'), { yPercent: 40, autoAlpha: 0, duration: 0.6 }, 7.0)
    .from(c('[data-reel="chip"]'), { scale: 0, rotate: -12, duration: 0.4, stagger: 0.12, ease: 'back.out(3)' }, 7.4)
    .from(c('[data-reel="cta"]'), { yPercent: 60, autoAlpha: 0, duration: 0.4, stagger: 0.1 }, 7.9);

  return tl;
}
```

- [ ] **Step 4: Write the controls and the reel component**

Create `src/chrome/ReelControls.tsx`:

```tsx
export function ReelControls({ playing, onSkip, onToggle }: { playing: boolean; onSkip: () => void; onToggle: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] flex gap-2" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <button type="button" className="meta min-h-[44px] bg-paper px-4 text-ink" onClick={onSkip}>
        Skip intro
      </button>
      <button type="button" className="meta min-h-[44px] bg-paper px-4 text-ink" onClick={onToggle}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

Create `src/film/Reel.tsx`:

```tsx
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type gsap from 'gsap';
import { readStored, REEL_KEY, useFilmStore, writeStored, type Mode } from './store';
import { buildReel } from './reelTimeline';
import { ReelControls } from '@/chrome/ReelControls';

const WORDS = ['PAYMENTS.', 'OFFLINE.', 'AI.', 'LOAD.', 'NAIROBI.'];

export function shouldPlayReel(mode: Mode): boolean {
  return mode === 'film' && readStored(REEL_KEY, true) !== '1';
}

export function Reel() {
  const mode = useFilmStore((s) => s.mode);
  const reelState = useFilmStore((s) => s.reelState);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (reelState === 'pending') {
      useFilmStore.getState().setReelState(shouldPlayReel(mode) ? 'playing' : 'done');
    }
  }, [mode, reelState]);

  const finish = useCallback(() => {
    tlRef.current?.progress(1).kill();
    tlRef.current = null;
    writeStored(REEL_KEY, '1', true);
    useFilmStore.getState().setReelState('done');
  }, []);

  const active = mode === 'film' && (reelState === 'playing' || reelState === 'paused' || reelState === 'pending');

  useLayoutEffect(() => {
    if (!active || !overlayRef.current || tlRef.current) return;
    const cover = document.querySelector<HTMLElement>('[data-shot="cover"]');
    const tl = buildReel(overlayRef.current, cover);
    tl.eventCallback('onComplete', finish);
    tlRef.current = tl;
    return () => {
      tlRef.current?.progress(1).kill();
      tlRef.current = null;
    };
  }, [active, finish]);

  useEffect(() => {
    if (!active) return;
    const end = () => finish();
    // Tab and Shift move focus to the reel's own controls; they must not end it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' && e.key !== 'Shift') finish();
    };
    const opts = { passive: true } as const;
    window.addEventListener('wheel', end, opts);
    window.addEventListener('touchmove', end, opts);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', end);
      window.removeEventListener('touchmove', end);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, finish]);

  if (!active) return null;

  const playing = reelState !== 'paused';
  const toggle = () => {
    if (playing) tlRef.current?.pause();
    else tlRef.current?.play();
    useFilmStore.getState().setReelState(playing ? 'paused' : 'playing');
  };

  return (
    <>
      <ReelControls playing={playing} onSkip={finish} onToggle={toggle} />
      <div ref={overlayRef} data-reel-overlay aria-hidden="true" className="fixed inset-0 z-[65] overflow-hidden bg-ink">
        <div className="absolute inset-0 flex flex-col justify-center gap-6">
          {['bg-signal', 'bg-cobalt', 'bg-lime'].map((c) => (
            <div key={c} data-reel="stripe" className={`h-[6vh] w-[140vw] ${c}`} />
          ))}
        </div>
        {WORDS.map((w) => (
          <div key={w} className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span data-reel="word" className="display block translate-y-[110%] text-[clamp(4rem,19vw,16rem)] text-paper">
              {w}
            </span>
          </div>
        ))}
        <svg data-reel="flowline" viewBox="0 0 400 60" className="absolute left-1/2 top-[70%] w-[70vw] -translate-x-1/2" fill="none">
          <path d="M10 30 H390" pathLength={1} strokeDasharray="1" stroke="hsl(var(--paper))" strokeWidth="3" />
          <path data-reel="break" d="M195 15 L205 45" stroke="hsl(var(--signal))" strokeWidth="6" style={{ visibility: 'hidden' }} />
          <circle data-reel="mend" cx="200" cy="30" r="9" fill="hsl(var(--lime))" style={{ visibility: 'hidden' }} />
        </svg>
        <div data-reel="wipe" className="absolute inset-0 bg-paper" style={{ clipPath: 'circle(0% at 50% 50%)' }} />
      </div>
    </>
  );
}
```

`finish` calls `progress(1)` before `kill()`, so every `from` tween on the cover lands at its natural state: skipping always leaves the cover complete.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/__tests__/film/Reel.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/film/Reel.tsx src/film/reelTimeline.ts src/chrome/ReelControls.tsx src/__tests__/film/Reel.test.tsx
git commit -m "feat: add the skippable, pausable cold-open reel"
```

---

### Task 8: Shots — Cover, Who, and the interim Back cover

**Files:**
- Create: `src/shots/Cover.tsx`, `src/shots/Who.tsx`, `src/shots/BackCover.tsx`, `src/shots/Figure.tsx`
- Create: `src/__tests__/shots/opening.test.tsx`

**Interfaces:**
- Consumes: `Shot` (Task 5), `ShotModule`, `ShotBuild` (Task 5), `seekToShot` (Task 6), `content`, `projectById` (Task 3).
- Produces: `CoverShot`, `WhoShot`, `BackCoverShot: ShotModule`; `<Figure media={Media} caption={string} priority?: boolean className?: string />`.
- Defs:
  - cover: `{ id: 'cover', chapter: 'cover', length: 1.5, hold: [0, 0.55] }`
  - who: `{ id: 'who', chapter: 'profile', length: 2, hold: [0.3, 0.75] }`
  - back-cover: `{ id: 'back-cover', chapter: 'contact', length: 2, hold: [0.4, 1] }`

- [ ] **Step 1: Write the test**

Create `src/__tests__/shots/opening.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { CoverShot } from '@/shots/Cover'
import { WhoShot } from '@/shots/Who'
import { BackCoverShot } from '@/shots/BackCover'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'cover', reelState: 'done' }))

describe('Cover', () => {
  it('has the single h1 with the readable name', () => {
    render(<CoverShot.Component />)
    expect(screen.getByRole('heading', { level: 1, name: 'Sydney Kamau' })).toBeInTheDocument()
  })

  it('shows positioning, three proof chips and both CTAs in the first frame', () => {
    render(<CoverShot.Component />)
    expect(screen.getByText(/solution nobody has drawn yet/i)).toBeInTheDocument()
    for (const name of ['AssetFlow Schools', 'Eventify', 'Digital Twin']) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: /work with me/i })).toHaveAttribute('href', '#shot-back-cover')
    expect(screen.getByRole('link', { name: /hiring\? cv/i })).toHaveAttribute('target', '_blank')
  })

  it('loads the portrait eagerly at high priority with explicit dimensions', () => {
    render(<CoverShot.Component />)
    const img = screen.getByRole('img', { name: /portrait of sydney kamau/i })
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
    expect(img).toHaveAttribute('width', '1200')
    expect(img).toHaveAttribute('height', '1500')
  })

  it('captions placeholder figures as placeholders', () => {
    render(<CoverShot.Component />)
    expect(screen.getByText(/placeholder/i)).toBeInTheDocument()
  })
})

describe('Who', () => {
  it('states who and links Invonics', () => {
    render(<WhoShot.Component />)
    expect(screen.getByRole('heading', { level: 2, name: /engineer\. founder\./i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /invonics technologies/i })).toHaveAttribute('href', 'https://invonicstechnologies.com')
  })
})

describe('Back cover (interim)', () => {
  it('lists every contact link and the CV', () => {
    render(<BackCoverShot.Component />)
    const region = screen.getByRole('region', { name: /write to me/i })
    for (const name of ['Email', 'GitHub', 'LinkedIn', 'Invonics Technologies']) {
      expect(within(region).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(region).getByRole('link', { name: /bring me onto your project/i }).getAttribute('href')).toMatch(/^mailto:sydneykamau2005@gmail\.com\?subject=/)
    expect(within(region).getByRole('link', { name: /hiring\? cv/i })).toBeInTheDocument()
  })

  it('never renders a phone number', () => {
    const { container } = render(<BackCoverShot.Component />)
    expect(container.textContent).not.toMatch(/\+?254|tel:/)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/__tests__/shots/opening.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `Figure`**

Create `src/shots/Figure.tsx`:

```tsx
import type { Media } from '@/content';

/** An editorial figure with crop marks and a caption; placeholders say so. */
export function Figure({ media, caption, priority = false, className = '' }: {
  media: Media; caption: string; priority?: boolean; className?: string;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div data-reel="portrait" className="relative bg-paper-raised">
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...{ fetchpriority: priority ? 'high' : 'auto' }}
          className="block h-auto w-full"
        />
        {/* Crop marks: four L-shaped corners just outside the image. */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-ink" />
      </div>
      <figcaption className="meta mt-2">
        {caption}
        {media.placeholder ? ' — placeholder' : ''}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 4: Write `Cover`**

Create `src/shots/Cover.tsx`:

```tsx
import { content, projectById } from '@/content';
import { Shot } from '@/film/Shot';
import { seekToShot } from '@/film/seek';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';
import { Figure } from './Figure';

const def: ShotDef = { id: 'cover', chapter: 'cover', length: 1.5, hold: [0, 0.55] };
const { profile, site, contact } = content;

function Component() {
  const [first, last] = profile.name.toUpperCase().split(' ');
  return (
    <Shot def={def} className="paper-texture">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pt-16 md:px-8">
        <div data-reel="masthead" className="meta flex justify-between border-b-2 border-ink py-2 text-ink">
          <span>Issue {site.issue} · Nairobi</span>
          <span className="hidden sm:inline">{profile.coords}</span>
          <span>{site.issueDate}</span>
        </div>
        <div className="livery mt-2" aria-hidden="true" />

        <div className="grid flex-1 items-center gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <p className="kicker">{profile.cover.kicker}</p>
            <h1 id="shot-cover-title" tabIndex={-1} className="display mt-3 text-[clamp(3.5rem,13vw,var(--step-8))] text-ink">
              <span className="sr-only">{profile.name}</span>
              <span aria-hidden="true">
                {[first, last].map((word) => (
                  <span key={word} className="block overflow-hidden">
                    {[...word].map((ch, i) => (
                      <span key={i} data-reel="letter" className="inline-block">{ch}</span>
                    ))}
                  </span>
                ))}
              </span>
            </h1>
            <p data-reel="standfirst" className="standfirst mt-5 max-w-xl text-[length:var(--step-1)] text-ink">
              {profile.cover.standfirst}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Featured work">
              {profile.cover.chips.map((id) => (
                <li key={id} data-reel="chip">
                  <a
                    href={`#shot-project-${id}`}
                    className="chip"
                    onClick={(e) => {
                      if (seekToShot(`project-${id}`, 'solves')) e.preventDefault();
                    }}
                  >
                    {projectById(id)?.name} ↓
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                data-reel="cta"
                href="#shot-back-cover"
                className="btn-signal"
                onClick={(e) => {
                  if (seekToShot('back-cover')) e.preventDefault();
                }}
              >
                Work with me
              </a>
              <a data-reel="cta" href={contact.cvPath} target="_blank" rel="noopener" className="btn-outline">
                Hiring? CV
              </a>
            </div>
          </div>
          <Figure media={profile.portrait} caption="Fig. 1 — the engineer, Nairobi" priority className="mx-auto w-[min(70vw,22rem)] md:w-full" />
        </div>
      </div>
    </Shot>
  );
}

export const CoverShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const q = (s: string) => root.querySelectorAll(s);
    tl.to(q('[data-reel="masthead"]'), { yPercent: -60, autoAlpha: 0, duration: 0.3 }, 0.9)
      .to(q('figure'), { scale: 1.25, yPercent: -8, duration: 0.6, ease: 'power2.in' }, 0.85)
      .to(q('h1, [data-reel="standfirst"], ul, [data-reel="cta"]'), { yPercent: -30, autoAlpha: 0, stagger: 0.04, duration: 0.35 }, 0.95);
  },
};
```

- [ ] **Step 5: Write `Who`**

Create `src/shots/Who.tsx`:

```tsx
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'who', chapter: 'profile', length: 2, hold: [0.3, 0.75] };
const { profile } = content;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-center gap-10 px-4 pt-20 md:grid-cols-[1fr_1fr] md:px-8">
        <div>
          <p className="kicker">II · Profile · Who</p>
          <h2 id="shot-who-title" tabIndex={-1} className="display mt-3 text-[clamp(3rem,10vw,var(--step-7))]">
            {profile.who.heading.split(' ').map((w, i) => (
              <span key={i} data-scatter className="inline-block pr-[0.2em]">{w}</span>
            ))}
          </h2>
        </div>
        <div className="border-l-2 border-ink pl-6">
          <p className="text-[length:var(--step-1)] leading-snug">{profile.who.body}</p>
          <div data-stamp className="mt-8 inline-block rotate-[-3deg] border-2 border-cobalt px-4 py-3">
            <p className="meta text-cobalt">On the side</p>
            <p className="mt-1">
              <a href={profile.companyUrl} target="_blank" rel="noopener" className="font-medium text-cobalt underline underline-offset-4">
                {profile.company}
              </a>
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">{profile.who.invonics}</p>
          </div>
        </div>
      </div>
    </Shot>
  );
}

export const WhoShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const words = root.querySelectorAll('[data-scatter]');
    tl.from(words, { yPercent: 120, rotate: 6, autoAlpha: 0, stagger: 0.08, duration: 0.3 }, 0.05)
      .from(root.querySelector('.border-l-2'), { clipPath: 'inset(0 100% 0 0)', duration: 0.3 }, 0.25)
      .from(root.querySelector('[data-stamp]'), { scale: 2.2, rotate: -18, autoAlpha: 0, duration: 0.2, ease: 'back.out(2)' }, 0.4);
    // Scatter out after the hold (0.75 × 2 = 1.5): letters fly into the stack diagram's direction.
    words.forEach((w, i) => {
      tl.to(w, { x: gsap.utils.random(-300, 300), y: gsap.utils.random(-200, 200), rotate: gsap.utils.random(-40, 40), autoAlpha: 0, duration: 0.35 }, 1.55 + i * 0.02);
    });
  },
};
```

Add `import gsap from 'gsap';` at the top of `Who.tsx`.

- [ ] **Step 6: Write the interim `BackCover`**

Create `src/shots/BackCover.tsx`:

```tsx
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'back-cover', chapter: 'contact', length: 2, hold: [0.4, 1] };
const { contact } = content;

const projectMail = `mailto:${contact.email}?subject=${encodeURIComponent(contact.project.subject)}&body=${encodeURIComponent(contact.project.body)}`;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-20 md:px-8">
        <div className="livery" aria-hidden="true" />
        <h2 id="shot-back-cover-title" tabIndex={-1} className="display mt-8 text-[clamp(3rem,11vw,var(--step-7))]">
          {contact.heading}
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a data-door href={projectMail} className="btn-signal">Bring me onto your project</a>
          <a data-door href={contact.cvPath} target="_blank" rel="noopener" className="btn-outline">Hiring? CV</a>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-3 border-t-2 border-ink pt-6 sm:grid-cols-2 md:grid-cols-4">
          {contact.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                {...(l.kind === 'email' ? {} : { target: '_blank', rel: 'noopener' })}
                className="inline-flex min-h-[28px] items-center font-medium text-cobalt underline underline-offset-4"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="meta mt-10">{contact.colophon}</p>
      </div>
    </Shot>
  );
}

export const BackCoverShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    tl.from(root.querySelector('.livery'), { scaleX: 0, transformOrigin: 'left', duration: 0.3 }, 0.1)
      .from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.3 }, 0.25)
      .from(root.querySelectorAll('[data-door]'), { scale: 1.6, rotate: -6, autoAlpha: 0, stagger: 0.08, duration: 0.25, ease: 'back.out(2)' }, 0.45)
      .from(root.querySelectorAll('li'), { yPercent: 50, autoAlpha: 0, stagger: 0.04, duration: 0.2 }, 0.6);
  },
};
```

The full three-door back cover (WhatsApp, phone, booking) replaces this in Stage C.

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/__tests__/shots/opening.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/shots src/__tests__/shots/opening.test.tsx
git commit -m "feat: add the cover, who, and interim back-cover shots"
```

---

### Task 9: Shots — What, Solves, For

**Files:**
- Create: `src/shots/What.tsx`, `src/shots/Solves.tsx`, `src/shots/For.tsx`, `src/shots/ProofChips.tsx`
- Create: `src/__tests__/shots/profile.test.tsx`

**Interfaces:**
- Consumes: as Task 8.
- Produces: `WhatShot`, `SolvesShot`, `ForShot: ShotModule`; `<ProofChips ids={string[]} />`.
- Defs:
  - what: `{ id: 'what', chapter: 'profile', length: 3, hold: [0.45, 0.85] }`
  - solves: `{ id: 'solves', chapter: 'profile', length: 3, hold: [0.72, 0.92] }`
  - for: `{ id: 'for', chapter: 'profile', length: 1.5, hold: [0.35, 0.8] }`

- [ ] **Step 1: Write the test**

Create `src/__tests__/shots/profile.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { WhatShot } from '@/shots/What'
import { SolvesShot } from '@/shots/Solves'
import { ForShot } from '@/shots/For'
import { useFilmStore } from '@/film/store'

beforeEach(() => useFilmStore.setState({ mode: 'article', activeShot: 'what', reelState: 'done' }))

describe('What', () => {
  it('renders the stack as five labelled layers with every item as text', () => {
    render(<WhatShot.Component />)
    const list = screen.getByRole('list', { name: /stack, by layer/i })
    const layers = [...list.querySelectorAll('[data-layer]')]
    expect(layers.map((l) => l.getAttribute('data-layer'))).toEqual(['AI', 'Android', 'Web', 'Backend', 'Data / infra'])
    for (const tech of ['PyTorch', 'Kotlin', 'Fastify', 'PostgreSQL']) {
      expect(within(list).getByText(tech)).toBeInTheDocument()
    }
  })
})

describe('Solves', () => {
  it('lists six conditions, each with proof chips naming real projects', () => {
    render(<SolvesShot.Component />)
    const items = screen.getAllByRole('listitem').filter((li) => li.hasAttribute('data-condition'))
    expect(items).toHaveLength(6)
    expect(within(items[1]).getByRole('link', { name: /eventify/i })).toHaveAttribute('href', '#shot-project-eventify')
    expect(within(items[4]).getByRole('link', { name: /invonics automations/i })).toBeInTheDocument()
  })
})

describe('For', () => {
  it('sets every sector and the tail line', () => {
    render(<ForShot.Component />)
    expect(screen.getByText('Event organisers')).toBeInTheDocument()
    expect(screen.getByText(/without a full-time hire/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/__tests__/shots/profile.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `ProofChips`**

Create `src/shots/ProofChips.tsx`:

```tsx
import { projectById } from '@/content';
import { seekToShot } from '@/film/seek';

export function ProofChips({ ids }: { ids: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <a
          key={id}
          href={`#shot-project-${id}`}
          className="chip"
          onClick={(e) => {
            if (seekToShot(`project-${id}`)) e.preventDefault();
          }}
        >
          {projectById(id)?.name}
        </a>
      ))}
    </span>
  );
}
```

When no project shot exists (Stage A), the click falls through to the native `#` anchor, which does nothing harmful.

- [ ] **Step 4: Write `What`**

Create `src/shots/What.tsx`:

```tsx
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'what', chapter: 'profile', length: 3, hold: [0.45, 0.85] };
const { what } = content.profile;
const FILL = ['bg-cobalt text-paper', 'bg-lime text-ink', 'bg-paper-raised text-ink', 'bg-ink text-paper', 'bg-signal text-ink'];

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-center gap-8 px-4 pt-20 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:px-8">
        <div>
          <p className="kicker">II · Profile · What</p>
          <h2 id="shot-what-title" tabIndex={-1} className="display mt-3 text-[clamp(2.75rem,8vw,var(--step-6))]">
            {what.heading}
          </h2>
          <p data-copy className="mt-5 max-w-lg text-[length:var(--step-0)] leading-relaxed text-ink-muted">{what.body}</p>
        </div>
        <ul aria-label="Stack, by layer" className="flex flex-col gap-2 [perspective:900px]">
          {what.layers.map((layer, i) => (
            <li key={layer.name} data-layer={layer.name} className={`border-2 border-ink px-4 py-3 ${FILL[i % FILL.length]}`}>
              <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-90">{layer.name}</p>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {layer.items.map((item) => (
                  <li key={item} data-item className="font-mono text-sm">{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Shot>
  );
}

export const WhatShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const layers = [...root.querySelectorAll<HTMLElement>('[data-layer]')];
    tl.from(root.querySelector('h2'), { yPercent: 80, autoAlpha: 0, duration: 0.3 }, 0.1)
      .from(root.querySelector('[data-copy]'), { autoAlpha: 0, y: 20, duration: 0.3 }, 0.25);
    layers.forEach((layer, i) => {
      const at = 0.35 + i * 0.18;
      tl.from(layer, { xPercent: i % 2 ? 110 : -110, rotateX: 50, autoAlpha: 0, duration: 0.3, ease: 'power3.out' }, at)
        .from(layer.querySelectorAll('[data-item]'), { yPercent: 100, autoAlpha: 0, stagger: 0.02, duration: 0.15 }, at + 0.15);
    });
    tl.to(layers, { rotateX: 12, yPercent: -6, stagger: 0.03, duration: 0.3 }, 2.6)
      .to(root.querySelector('ul'), { scale: 0.85, autoAlpha: 0.2, duration: 0.15 }, 2.85);
  },
};
```

Layers enter between 0.35 and ~1.3, all before the hold at 1.35 (0.45 × 3); exit motion starts at 2.6 (after 0.85 × 3 = 2.55).

- [ ] **Step 5: Write `Solves`**

Create `src/shots/Solves.tsx`:

```tsx
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';
import { ProofChips } from './ProofChips';

const def: ShotDef = { id: 'solves', chapter: 'profile', length: 3, hold: [0.72, 0.92] };
const { solves } = content.profile;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-20 md:px-8">
        <p className="kicker">II · Profile · Solves</p>
        <h2 id="shot-solves-title" tabIndex={-1} className="display mt-3 max-w-4xl text-[clamp(2.25rem,6vw,var(--step-5))]">
          {solves.heading}
        </h2>
        <ol className="mt-8 grid gap-x-8 md:grid-cols-2">
          {solves.items.map((item, i) => (
            <li key={item.condition} data-condition className="relative overflow-hidden border-t-2 border-ink py-3">
              <span data-hit aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-signal" />
              <span data-fix aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-lime" />
              <div className="relative flex items-start gap-3">
                <span className="meta pt-1 text-ink">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-medium leading-snug">{item.condition}</p>
                  <div className="mt-2">
                    <ProofChips ids={item.proof} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Shot>
  );
}

export const SolvesShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    tl.set(root.querySelectorAll('[data-hit], [data-fix]'), { scaleX: 0 }, 0)
      .from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.3 }, 0.1);
    root.querySelectorAll<HTMLElement>('[data-condition]').forEach((row, i) => {
      const at = 0.4 + i * 0.28;
      tl.from(row, { x: -40, autoAlpha: 0, duration: 0.12 }, at)
        .to(row.querySelector('[data-hit]'), { scaleX: 1, duration: 0.08, ease: 'power4.in' }, at + 0.08)
        .to(row.querySelector('[data-hit]'), { scaleX: 0, transformOrigin: 'right', duration: 0.06 }, at + 0.16)
        .to(row.querySelector('[data-fix]'), { scaleX: 1, duration: 0.06 }, at + 0.16)
        .to(row.querySelector('[data-fix]'), { scaleX: 0, transformOrigin: 'right', duration: 0.06 }, at + 0.22);
    });
  },
};
```

Six rows finish by 0.4 + 5 × 0.28 + 0.28 = 2.08, before the hold at 2.16 (0.72 × 3). Each row is hit by a signal bar ("the condition"), then wiped lime ("fixed"), and the text is never covered during the hold.

- [ ] **Step 6: Write `For`**

Create `src/shots/For.tsx`:

```tsx
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'for', chapter: 'profile', length: 1.5, hold: [0.35, 0.8] };
const f = content.profile.for;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-20 md:px-8">
        <p className="kicker">II · Profile · For</p>
        <h2 id="shot-for-title" tabIndex={-1} className="display mt-3 text-[clamp(2.5rem,7vw,var(--step-6))]">{f.heading}</h2>
        <ul className="mt-8 border-t-2 border-ink">
          {f.sectors.map((s, i) => (
            <li key={s} data-sector className="flex items-baseline gap-4 border-b border-ink/20 py-2">
              <span className="meta">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-[clamp(1.5rem,4vw,var(--step-3))]">{s}</span>
            </li>
          ))}
        </ul>
        <p data-tail className="standfirst mt-6 text-[length:var(--step-1)]">{f.tail}</p>
      </div>
    </Shot>
  );
}

export const ForShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    tl.from(root.querySelectorAll('[data-sector]'), { clipPath: 'inset(0 100% 0 0)', stagger: 0.05, duration: 0.15 }, 0.05)
      .from(root.querySelector('[data-tail]'), { autoAlpha: 0, y: 16, duration: 0.15 }, 0.35);
  },
};
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/__tests__/shots/profile.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/shots src/__tests__/shots/profile.test.tsx
git commit -m "feat: add the what, solves, and for shots"
```

---

### Task 10: Wire the film into the app and retire the scene layer

**Files:**
- Create: `src/shots/index.ts`
- Replace: `src/App.tsx`, `src/__tests__/App.test.tsx`
- Delete: `src/scenes/`, `src/components/SceneFrame.tsx`, `src/components/NavDots.tsx`, `src/components/ProgressBar.tsx`, `src/components/Magnetic.tsx`, `src/motion/variants.ts`, `src/content/content.ts`, `src/__tests__/scenes/`, `src/__tests__/components/`
- Modify: `package.json` (remove `framer-motion`), `src/__tests__/design/deps.test.ts` (assert it is gone)

**Interfaces:**
- Consumes: every shot module (Tasks 8–9), `Stage`, `Reel`, `ChapterBar`, `SkipLink`, `useModeBootstrap`.
- Produces: `SHOTS: ShotModule[]` in film order.

- [ ] **Step 1: Write the App test**

Replace `src/__tests__/App.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { setMatchMedia } from './setup'
import { useFilmStore } from '@/film/store'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useFilmStore.setState({ activeShot: 'cover', mode: 'film', modeReason: 'default', reelState: 'pending' })
})

describe('App', () => {
  it('renders the Stage A shots in film order', () => {
    const { container } = render(<App />)
    const ids = [...container.querySelectorAll('[data-shot]')].map((el) => el.getAttribute('data-shot'))
    expect(ids).toEqual(['cover', 'who', 'what', 'solves', 'for', 'back-cover'])
  })

  it('has exactly one h1', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('renders chapters, skip link and mode toggle', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Chapters' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skip to contact/i })).toBeInTheDocument()
  })

  it('in reduced motion, renders the article: no reel, nothing inert, every shot heading reachable', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { container } = render(<App />)
    expect(useFilmStore.getState().mode).toBe('article')
    expect(container.querySelector('[data-reel-overlay]')).toBeNull()
    expect(container.querySelectorAll('[inert]')).toHaveLength(0)
    for (const name of [/sydney kamau/i, /engineer\. founder\./i, /whole systems/i, /real conditions/i, /who it's for/i, /write to me/i]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: FAIL — the old App renders `[data-scene]`, not `[data-shot]`.

- [ ] **Step 3: Write the shot list and the App**

Create `src/shots/index.ts`:

```ts
import type { ShotModule } from '@/film/useFilm';
import { CoverShot } from './Cover';
import { WhoShot } from './Who';
import { WhatShot } from './What';
import { SolvesShot } from './Solves';
import { ForShot } from './For';
import { BackCoverShot } from './BackCover';

/** Film order. Stage B inserts Case files, explainers and the index roll before BackCover. */
export const SHOTS: ShotModule[] = [CoverShot, WhoShot, WhatShot, SolvesShot, ForShot, BackCoverShot];
```

Replace `src/App.tsx`:

```tsx
import { Stage } from '@/film/Stage';
import { Reel } from '@/film/Reel';
import { useModeBootstrap } from '@/film/useModeBootstrap';
import { ChapterBar } from '@/chrome/ChapterBar';
import { SkipLink } from '@/chrome/SkipLink';
import { SHOTS } from '@/shots';

const App = () => {
  useModeBootstrap();
  return (
    <>
      <SkipLink />
      <ChapterBar />
      <main>
        <Stage shots={SHOTS} />
      </main>
      <Reel />
    </>
  );
};

export default App;
```

`ChapterBar` reads `engine.placed`, which `useFilm` fills during the Stage's layout effect. On the very first paint the bar can render empty for one frame; add this at the top of `ChapterBar` so it re-renders once placement exists:

```tsx
  const [, force] = useState(0);
  useEffect(() => {
    if (engine.placed.length) force((n) => n + 1);
  }, []);
```

(import `useEffect`, `useState` from `react`). Because `useFilm` runs `placeShots` before its `enabled` check, placement exists in article mode too.

- [ ] **Step 4: Delete the scene layer and Framer Motion**

```bash
git rm -r src/scenes src/__tests__/scenes src/__tests__/components
git rm src/components/SceneFrame.tsx src/components/NavDots.tsx src/components/ProgressBar.tsx src/components/Magnetic.tsx src/motion/variants.ts src/content/content.ts
npm uninstall framer-motion
```

In `src/__tests__/design/deps.test.ts`, add to the "never installs a 3D stack" test's sibling:

```ts
  it('has retired Framer Motion in favour of GSAP', () => {
    expect(deps).not.toHaveProperty('framer-motion')
  })
```

Run: `npx tsc -p tsconfig.app.json --noEmit`
Expected: no errors. Any remaining import of a deleted file is a bug in this task — fix it here.

- [ ] **Step 5: Run the full suite**

Run: `npx vitest run`
Expected: PASS everywhere. The bundle-size test builds the app; its 800KB total budget still holds.

- [ ] **Step 6: Commit**

```bash
git add -A src package.json package-lock.json
git commit -m "feat: run the portfolio as a film and retire the stacked scene layer"
```

---

### Task 11: Verify in the browser, then measure the reel's LCP

**Files:**
- Modify: `reports/` (Lighthouse output, not committed unless the owner asks)

**Interfaces:** none.

This task is verification. The owner drives the browser; the implementer runs the CLI.

- [ ] **Step 1: Build and serve**

```bash
npm run build
npx vite preview --port 4173
```

(run the preview in the background)

- [ ] **Step 2: Lighthouse, mobile**

```bash
npx lighthouse http://localhost:4173 --preset=perf --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility --output=json --output-path=./reports/stage-a.json --chrome-flags="--headless=new"
node -e "const r=require('./reports/stage-a.json');const a=r.audits;console.log({LCP:a['largest-contentful-paint'].displayValue,CLS:a['cumulative-layout-shift'].displayValue,TBT:a['total-blocking-time'].displayValue,perf:r.categories.performance.score,a11y:r.categories.accessibility.score,lcpEl:a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet})"
```

Expected: LCP < 2.5s, CLS < 0.1, accessibility ≥ 0.95. Record the LCP element.

- [ ] **Step 3: If LCP ≥ 2.5s, apply the spec §6 fallback**

In `src/film/reelTimeline.ts`, remove the `.from(c('[data-reel="letter"]') …)` tween so the cover line is painted at frame 0, and re-run Step 2. Commit with `fix: paint the cover line at frame 0 to keep LCP under budget`.

- [ ] **Step 4: Hand the owner the checklist**

Tell the owner to open `http://localhost:4173` and check:
1. The reel plays once, Skip and Pause work, scrolling during it skips to the cover.
2. Scrolling scrubs Cover → Who → What → Solves → For → Back cover, both directions; text is still during each hold.
3. Chapter buttons and the cover chips jump to holds; "Work with me" lands on the back cover.
4. "Read as article" gives a normal page; "Watch as film" returns; a reload keeps the choice.
5. On a phone (or DevTools mobile), the film still plays and nothing overflows sideways.
6. With OS "reduce motion" on, the page loads as the article with no reel.

---

### Task 12: Stock placeholder shortlist (owner-gated)

**Files:**
- Later: `public/images/placeholders/*.webp`, content `figure`/`portrait` entries

**Interfaces:** none.

- [ ] **Step 1: Shortlist, do not download**

Search Unsplash and Pexels for: a matatu / Nairobi street (Who), a classroom (AssetFlow), a crowd at a concert gate (Eventify), a study desk with laptop and notes (Digital Twin), a farmer with crops (FarmAssist), a phone held at night (FoRUs), a football on grass (Off-hours, Stage C). For each slot give two options: page URL, photographer, licence. Present the list to the owner.

- [ ] **Step 2: Stop for approval**

Nothing is downloaded until the owner approves specific images. After approval, a follow-up task converts them to WebP at 800w/1600w, updates `width`/`height`/`credit` in content, keeps `placeholder: true` on project figures, and adds credits to the colophon.

---

## Self-review notes

- **Spec coverage (Stage A):** tokens/fonts/texture → T2; content files, plugin, schema, build failure cases → T3; registry/holds/seek → T4, T6; stage, shots, inert, article mode, mode toggle → T5, T6; chapter bar, Work with me, skip link → T6; reel with pause/skip/once-per-session/any-input/no-flash → T7; shots 0–4 + interim contact → T8, T9; retire scene layer and Framer → T10; LCP check and fallback → T11; placeholder shortlist gate → T12. Stage B/C/D items (flows shots, phone, Umami, CV PDF, no-JS pre-render, bundle rewrite) are out of scope by design.
- **Placeholders:** none; every code step carries code.
- **Type consistency:** `ShotModule`/`ShotBuild` defined in T5 and used in T8–T10; `seekToShot(id, fallback?)` defined T6, used T6/T8/T9; `Media` from T3 used by `Figure` in T8; `engine.placed` set in T5, read in T6/T10.
- **Review Focus** tests: CRLF → T3 step 2; remount → T5 step 1; storage blocked → T4 step 2 and T7 step 1; input during reel → T7 step 1; seek fallback → T6 step 1.
