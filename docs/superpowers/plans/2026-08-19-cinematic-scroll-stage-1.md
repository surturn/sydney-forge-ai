# Cinematic Scroll Portfolio — Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-page router site with a single continuous scroll spine — Dusk design tokens, a scroll engine, nav chrome, a finished Scene 0 and Scene 1, and stub sections for Scenes 2–5.

**Architecture:** Lenis drives native `window.scrollY`. One rAF tick writes a module-level mutable `scrollState` object that Framer Motion and (later) R3F read imperatively; zustand holds only discrete state so nothing re-renders at frame rate. Scenes are stacked sections in one page; horizontal motion is scroll-*linked* via a tall section with a sticky inner track, never event interception.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind, Framer Motion 12, Lenis, zustand, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-19-cinematic-scroll-portfolio-design.md`

## Global Constraints

- **No light mode.** Single committed dark look. `next-themes`, `ThemeProvider`, `ThemeToggle` are removed. Do not add a theme toggle.
- **Border radius is `0` everywhere.** `--radius: 0rem`.
- **Display face is Bodoni Moda at `wght 700`, `font-variation-settings: 'opsz' 24`.** Never a lighter weight — the poster weight is what makes it survive grain on a dark ground.
- **No phone number anywhere in the codebase.** The CV's `+254 794 817 115` must not appear in any file.
- **Continuous scroll values never live in React state.** No `useState`/zustand for `progress` or `velocity`. Violating this is the single worst regression available in this codebase.
- **Every scene renders complete and legible with motion disabled and at coarse pointer.**
- **`index.html` must keep** `rel="preconnect"` to both Google Fonts hosts, `crossorigin` on the `gstatic` link, and `display=swap`. Three existing tests assert these (`security/headers.test.ts:72,79`, `speed/core-web-vitals.test.ts:38,238`).
- **Do not install `three`, `@react-three/fiber`, or `@react-three/drei` in this stage.** Stage 1 has no WebGL; unused deps are deferred to Stage 3 (deviation from spec §7, which listed them under "add" without staging them).
- Content comes only from `src/content/content.ts`. No copy hardcoded in scene components.
- **File consolidation vs spec §6.** The spec's file list names `lib/usePointerCoarse.ts` and `lib/useSceneProgress.ts` as separate modules. This plan folds the first into `lib/useMediaQuery.ts` (it is one of three hooks over the same `matchMedia` primitive) and the second into `lib/scrollStore.ts` (scene progress is computed by the same rAF tick that owns `scrollState`, and splitting them would mean exporting the mutable object across a boundary for no gain). Everything else in §6 is built exactly as listed.

---

### Task 1: Dusk design tokens and typography

Replaces the FORGE palette with Dusk. Existing semantic token *names* (`--background`, `--foreground`, `--primary`…) are kept and remapped, so surviving components keep compiling while pages are still present.

**Files:**
- Modify: `src/index.css` (full rewrite of the token layer)
- Modify: `tailwind.config.ts:16-20` (font families)
- Modify: `index.html:8` (font link), `index.html:10-12` (title/description)
- Test: `src/__tests__/design/tokens.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--ground`, `--ground-raised`, `--ground-lifted`, `--ink`, `--ink-muted`, `--amber`, `--gold`, `--ease-cinematic`, `--step--1` … `--step-8`; Tailwind families `font-display`, `font-sans`, `font-mono`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/design/tokens.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8')
const html = readFileSync(join(process.cwd(), 'index.html'), 'utf-8')
const tw = readFileSync(join(process.cwd(), 'tailwind.config.ts'), 'utf-8')

describe('Dusk design tokens', () => {
  it('defines the Dusk palette tokens', () => {
    expect(css).toContain('--ground: 254 37% 7%')
    expect(css).toContain('--ink: 38 35% 92%')
    expect(css).toContain('--amber: 24 100% 62%')
    expect(css).toContain('--gold: 42 86% 63%')
  })

  it('maps semantic tokens onto Dusk', () => {
    expect(css).toContain('--background: 254 37% 7%')
    expect(css).toContain('--primary: 24 100% 62%')
  })

  it('keeps radius at zero', () => {
    expect(css).toContain('--radius: 0rem')
  })

  it('has no light-mode block', () => {
    expect(css).not.toContain('.dark {')
    expect(css).not.toMatch(/prefers-color-scheme/)
  })

  it('defines the full type scale', () => {
    for (const step of ['--step--1', '--step-0', '--step-4', '--step-8']) {
      expect(css).toContain(step)
    }
  })

  it('registers the three families in Tailwind', () => {
    expect(tw).toContain("'Bodoni Moda'")
    expect(tw).toContain("'Inter Tight'")
    expect(tw).toContain("'IBM Plex Mono'")
  })

  it('loads the fonts with the attributes the perf/security tests require', () => {
    expect(html).toContain('Bodoni+Moda')
    expect(html).toContain('IBM+Plex+Mono')
    expect(html).toContain('Inter+Tight')
    expect(html).toContain('display=swap')
    expect(html).toMatch(/rel\s*=\s*["']preconnect["']/)
    expect(html).toContain('crossorigin')
  })

  it('no longer loads the retired families', () => {
    expect(html).not.toContain('Fraunces')
    expect(html).not.toContain('JetBrains+Mono')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/design/tokens.test.ts`
Expected: FAIL — `--ground` not found in `src/index.css`.

- [ ] **Step 3: Rewrite the token layer in `src/index.css`**

The current file has two `@layer base` blocks: the first holds the FORGE `:root`
and `.dark` token definitions, the second holds element rules. **Delete the
first block entirely** (including all of `.dark`) and put the code below in its
place. **Keep the second `@layer base` block with three deletions** — the
`*`/`html`/`body` rules, `::selection`, `:focus-visible`, the scrollbar rules,
and the `prefers-reduced-motion` block all carry over unchanged, but delete:

1. the `body::before` film-grain overlay — `SceneFrame` paints grain per scene
   in Task 5, and keeping both would double it and fight the scenes' stacking
   contexts;
2. the `.display` rule in that block — the `@layer components` `.display` below
   replaces it, and two competing definitions is exactly the kind of drift that
   makes type look wrong for reasons nobody can find;
3. `font-feature-settings: "ss01", "cv01"` on `body` — those are Inter
   stylistic sets that Bodoni Moda and Inter Tight do not share.

**Delete the old `@layer components` and `@layer
utilities` blocks** (`.kicker`, `.panel`, `.hover-cell`, `.section`, `.measure`,
`.text-gradient`, `.bg-grid`, `.ember-glow`, `.link-underline`) — they belong to
the retired FORGE system, and the components that used them are deleted in
Task 9. The `.display` rule below supersedes the old one.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
  DUSK DESIGN SYSTEM
  Nairobi Dusk palette × Title Card typography, poster weight.
  Single committed dark look — no light mode, no theme toggle.
  All colors are HSL triplets. Semantic tokens only.
*/

@layer base {
  :root {
    /* --- Dusk palette --- */
    --ground: 254 37% 7%;
    --ground-raised: 257 44% 11%;
    --ground-lifted: 260 49% 17%;
    --ink: 38 35% 92%;
    --ink-muted: 260 17% 63%;
    --amber: 24 100% 62%;
    --gold: 42 86% 63%;

    /* --- Semantic tokens (names retained from FORGE, values remapped) --- */
    --background: 254 37% 7%;
    --foreground: 38 35% 92%;
    --card: 257 44% 11%;
    --card-foreground: 38 35% 92%;
    --popover: 257 44% 11%;
    --popover-foreground: 38 35% 92%;
    --primary: 24 100% 62%;
    --primary-foreground: 254 37% 7%;
    --secondary: 260 49% 17%;
    --secondary-foreground: 38 35% 92%;
    --muted: 260 49% 17%;
    --muted-foreground: 260 17% 63%;
    --accent: 42 86% 63%;
    --accent-foreground: 254 37% 7%;
    --destructive: 0 65% 52%;
    --destructive-foreground: 38 35% 96%;
    --border: 260 20% 22%;
    --input: 260 20% 26%;
    --ring: 24 100% 62%;
    --radius: 0rem;

    /* --- Motion --- */
    --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);

    /* --- Type scale: perfect fourth (1.333), Title Card jumps --- */
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

    /* --- Signature dusk gradient --- */
    --dusk: radial-gradient(120% 85% at 80% 6%,
              hsl(var(--amber) / .40) 0%,
              hsl(var(--gold) / .12) 28%,
              transparent 64%),
            linear-gradient(180deg,
              hsl(var(--ground-lifted)) 0%,
              hsl(258 47% 11%) 48%,
              hsl(var(--ground)) 100%);
  }
}

@layer components {
  /* Display: poster-weight didone. Never lighter than 700. */
  .display {
    @apply font-display;
    font-weight: 700;
    font-variation-settings: 'opsz' 24;
    letter-spacing: -0.015em;
    line-height: 0.92;
  }

  /* Monospace eyebrow / meta register */
  .kicker {
    @apply font-mono uppercase;
    font-size: var(--step--1);
    letter-spacing: 0.18em;
    color: hsl(var(--amber));
  }

  .kicker-muted {
    @apply font-mono uppercase;
    font-size: var(--step--1);
    letter-spacing: 0.18em;
    color: hsl(var(--ink-muted));
  }

  .dusk-bg {
    background: var(--dusk);
  }
}
```

- [ ] **Step 4: Swap the Tailwind families**

In `tailwind.config.ts`, replace the `fontFamily` block:

```ts
      fontFamily: {
        sans: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Bodoni Moda', 'Didot', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
```

Also change `darkMode: ["class"]` to `darkMode: "class"` and leave it unused — there is no light mode to toggle against.

- [ ] **Step 5: Swap the font link and metadata in `index.html`**

Replace the stylesheet `<link>` (keep both `preconnect` lines exactly as they are):

```html
  <link
    href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700&family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600&display=swap"
    rel="stylesheet">
  <title>Sydney Kamau — Full-Stack Developer, Nairobi</title>
  <meta name="description"
    content="Full-stack developer in Nairobi building scalable web applications, automation systems, and AI-powered platforms for agriculture, government service delivery, and business." />
```

Update the two `og:` and one `twitter:` description/title tags to match this wording.

- [ ] **Step 6: Run the test and the existing perf/security suites**

Run: `npx vitest run src/__tests__/design/ src/__tests__/security/headers.test.ts src/__tests__/speed/core-web-vitals.test.ts`
Expected: PASS. If `headers.test.ts` or `core-web-vitals.test.ts` fail, a required font attribute was dropped in Step 5 — restore it rather than editing those tests.

- [ ] **Step 7: Commit**

```bash
git add src/index.css tailwind.config.ts index.html src/__tests__/design/
git commit -m "feat: replace FORGE tokens with Dusk palette and Title Card type"
```

---

### Task 2: Content module

Single source of truth for all copy. Every later task reads from here.

**Files:**
- Create: `src/content/content.ts`
- Test: `src/__tests__/content/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Media = { src: string | null; alt: string }`
  - `type StackGroup = { group: string; items: string[] }`
  - `type Panel = { kicker: string; heading: string[]; body?: string }`
  - `type Project = { id: string; name: string; status: string; blurb: string; bullets: string[]; stack: string[]; poster: Media }`
  - `type Credential = { title: string; issuer: string; period: string; note: string }`
  - `type Link = { label: string; href: string; kind: 'email' | 'external' }`
  - `export const content` with keys `identity`, `scene1`, `projects`, `hobbies`, `credentials`, `outro`
  - `export const SCENES: { index: number; id: string; label: string }[]` — six entries, used by NavDots and the scroll engine.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/content/content.test.ts
import { describe, it, expect } from 'vitest'
import { content, SCENES } from '@/content/content'

describe('content module', () => {
  it('carries identity without a phone number', () => {
    expect(content.identity.name).toBe('Sydney Kamau')
    expect(content.identity.location).toBe('Nairobi, Kenya')
    expect(content.identity.email).toBe('sydneykamau2005@gmail.com')
    expect(JSON.stringify(content)).not.toMatch(/794\s?817\s?115/)
    expect(JSON.stringify(content)).not.toMatch(/\+254/)
  })

  it('has three panels in scene 1 and a grouped stack rail', () => {
    expect(content.scene1.panels).toHaveLength(3)
    const groups = content.scene1.stack.map((g) => g.group)
    expect(groups).toEqual(['Languages', 'Frameworks', 'Tools', 'Competencies'])
    for (const g of content.scene1.stack) expect(g.items.length).toBeGreaterThan(0)
  })

  it('carries exactly the four CV projects, each with stack and poster', () => {
    expect(content.projects.map((p) => p.id)).toEqual([
      'assetflow', 'eventify', 'farmassist', 'leadgen',
    ])
    for (const p of content.projects) {
      expect(p.stack.length).toBeGreaterThan(0)
      expect(p.bullets.length).toBeGreaterThan(0)
      expect(p).toHaveProperty('poster.alt')
    }
  })

  it('carries five credentials', () => {
    expect(content.credentials).toHaveLength(5)
  })

  it('exposes six scenes with stable ids', () => {
    expect(SCENES).toHaveLength(6)
    expect(SCENES.map((s) => s.id)).toEqual([
      'cold-open', 'personal', 'work', 'hobbies', 'credentials', 'outro',
    ])
    SCENES.forEach((s, i) => expect(s.index).toBe(i))
  })

  it('outro links contain no phone and include email and github', () => {
    const kinds = content.outro.links.map((l) => l.kind)
    expect(kinds).toContain('email')
    expect(content.outro.links.some((l) => l.href.includes('github.com/surturn'))).toBe(true)
    expect(content.outro.links.every((l) => !l.href.startsWith('tel:'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/content/content.test.ts`
Expected: FAIL — cannot resolve `@/content/content`.

- [ ] **Step 3: Write `src/content/content.ts`**

```ts
/**
 * SINGLE SOURCE OF TRUTH for all copy and asset paths.
 * Real photos/scans land here later — a `null` src renders a labelled
 * placeholder rather than breaking. Never hardcode copy in a scene.
 */

export type Media = { src: string | null; alt: string };
export type StackGroup = { group: string; items: string[] };
export type Panel = { kicker: string; heading: string[]; body?: string };

export type Project = {
  id: string;
  name: string;
  status: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  poster: Media;
};

export type Credential = {
  title: string;
  issuer: string;
  period: string;
  note: string;
};

export type Link = { label: string; href: string; kind: 'email' | 'external' };

export const SCENES = [
  { index: 0, id: 'cold-open', label: 'Cold Open' },
  { index: 1, id: 'personal', label: 'Personal' },
  { index: 2, id: 'work', label: 'Work' },
  { index: 3, id: 'hobbies', label: 'Hobbies' },
  { index: 4, id: 'credentials', label: 'Credentials' },
  { index: 5, id: 'outro', label: 'Outro' },
] as const;

export const content = {
  identity: {
    name: 'Sydney Kamau',
    role: 'Full-Stack Developer',
    location: 'Nairobi, Kenya',
    coords: '-1.2921°, 36.8219°',
    email: 'sydneykamau2005@gmail.com',
    github: 'https://github.com/surturn',
    company: 'Invonics Technologies',
    companyUrl: 'https://invonicstechnologies.com',
  },

  scene1: {
    panels: [
      {
        kicker: 'II — PERSONAL',
        heading: ['Nairobi,', 'and a habit', 'of shipping.'],
        body:
          'Full-stack developer building scalable web applications, automation systems, and AI-powered platforms.',
      },
      {
        kicker: 'THE WORK',
        heading: ['Real problems,', 'in real sectors.'],
        body:
          'Agriculture, government service delivery, and business automation — end-to-end systems that hold up in production, including a live school asset-management platform and an event ticketing platform for the Kenyan market.',
      },
      {
        kicker: 'THE STACK',
        heading: ['What it', 'runs on.'],
      },
    ] as Panel[],

    stack: [
      { group: 'Languages', items: ['JavaScript', 'Python', 'SQL', 'HTML', 'CSS'] },
      { group: 'Frameworks', items: ['React', 'Node.js', 'Tailwind CSS', 'Django', 'FastAPI'] },
      {
        group: 'Tools',
        items: [
          'Firebase', 'Docker', 'Git/GitHub', 'n8n', 'Linux', 'Nginx',
          'Redis', 'Celery', 'ngrok', 'PostgreSQL', 'Sentry', 'Cloudflare R2',
        ],
      },
      {
        group: 'Competencies',
        items: [
          'Full-Stack Development', 'REST APIs', 'Database Design',
          'Debugging', 'Automation Workflows',
        ],
      },
    ] as StackGroup[],
  },

  projects: [
    {
      id: 'assetflow',
      name: 'AssetFlow Schools',
      status: 'Deployed',
      blurb:
        "School asset-management platform, positioned against the Auditor-General's finding of KSh 6.6 billion in unaccounted assets at Kenyan public secondary schools.",
      bullets: [
        'Designed and shipped a QR-code asset-tagging architecture for tracking school assets end to end',
        'Led a full product-admin panel audit and integrated Sentry with structured logging (structlog/Loki) for production observability',
        'Built competitive positioning and battlecards against incumbent providers',
      ],
      stack: ['React', 'Django', 'PostgreSQL', 'Celery', 'Redis', 'Cloudflare R2'],
      poster: { src: null, alt: 'AssetFlow Schools asset-tagging dashboard' },
    },
    {
      id: 'eventify',
      name: 'Eventify',
      status: 'Deployed',
      blurb: 'Event ticketing platform built for the Kenyan market.',
      bullets: [
        'Led a security audit covering five attacker profiles, hardening against scalping, freeloading, and offline gate-scanner reconciliation fraud',
        'Built a Material 3 design system and an organiser-first homepage strategy to drive event-host adoption',
      ],
      stack: ['React', 'Material 3'],
      poster: { src: null, alt: 'Eventify ticketing interface' },
    },
    {
      id: 'farmassist',
      name: 'FarmAssist',
      status: 'AI Farming Companion',
      blurb:
        'AI-powered platform assisting farmers with crop disease detection and decision-making.',
      bullets: [
        'Integrated AI vision models and weather-based recommendations',
        'Designed full-stack architecture and real-time data handling',
      ],
      stack: ['Node.js', 'Express', 'React', 'Tailwind CSS', 'YOLOv8'],
      poster: { src: null, alt: 'FarmAssist crop disease detection view' },
    },
    {
      id: 'leadgen',
      name: 'Lead Generation Automation',
      status: 'Automation System',
      blurb: 'Automated pipelines for scraping and routing leads.',
      bullets: [
        'Reduced manual workload by over 60 percent',
        'Implemented API integrations and deployed using Docker',
      ],
      stack: ['FastAPI', 'JavaScript', 'Docker'],
      poster: { src: null, alt: 'Lead generation pipeline diagram' },
    },
  ] as Project[],

  hobbies: {
    items: [
      {
        title: 'Football',
        body: 'The original systems game — eleven variables, one objective, endless optimisation.',
      },
      {
        title: 'FIFA',
        body: "Strategy and optimisation don't stop at the keyboard.",
      },
    ],
    poster: { src: null, alt: 'A football at rest' },
  },

  credentials: [
    {
      title: 'BSc, Computer Science',
      issuer: 'Multimedia University of Kenya',
      period: '2024 — Present',
      note: 'Software engineering and AI/ML systems.',
    },
    {
      title: 'Certificate in Full Stack Development',
      issuer: 'Emobilis',
      period: '2024',
      note: 'Comprehensive full-stack program covering modern web technologies.',
    },
    {
      title: "President's Award Kenya",
      issuer: 'Gold Level — Chairman, Western Region',
      period: 'Leadership',
      note: 'Led regional programs and coordinated multi-team initiatives.',
    },
    {
      title: 'Quantium',
      issuer: 'Simulation',
      period: 'Training',
      note: 'Built a data-driven pricing analysis application.',
    },
    {
      title: 'Datacom',
      issuer: 'Simulation',
      period: 'Training',
      note: 'Used AI tools for debugging and system design.',
    },
  ] as Credential[],

  outro: {
    signoff: 'Built from Nairobi.',
    links: [
      { label: 'Email', href: 'mailto:sydneykamau2005@gmail.com', kind: 'email' },
      { label: 'GitHub', href: 'https://github.com/surturn', kind: 'external' },
      { label: 'Invonics Technologies', href: 'https://invonicstechnologies.com', kind: 'external' },
    ] as Link[],
  },
};
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/__tests__/content/content.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/content/ src/__tests__/content/
git commit -m "feat: add content module as single source of truth"
```

---

### Task 3: Environment hooks

Reduced-motion and coarse-pointer detection. jsdom has no `matchMedia`, so this task also adds the test-suite mock every later task depends on.

**Files:**
- Create: `src/lib/useMediaQuery.ts`
- Modify: `src/__tests__/setup.ts`
- Test: `src/__tests__/lib/useMediaQuery.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `useMediaQuery(query: string): boolean`
  - `usePrefersReducedMotion(): boolean`
  - `useCoarsePointer(): boolean` — true when `(pointer: coarse)` matches **or** viewport `< 768px`
  - `setMatchMedia(matches: Record<string, boolean>): void` exported from the test setup for use in later tests.

- [ ] **Step 1: Add the `matchMedia` mock to `src/__tests__/setup.ts`**

`ResizeObserver` is mocked here too, not speculatively: **Lenis constructs a
`ResizeObserver` on init, and jsdom does not implement one.** Without this mock
the `App` test in Task 9 throws as soon as `useScrollEngine` runs.
`IntersectionObserver` is mocked alongside it for Stage 3's canvas lifecycle.

```ts
import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

class MockObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  root = null
  rootMargin = ''
  thresholds = []
}

vi.stubGlobal('ResizeObserver', MockObserver)
vi.stubGlobal('IntersectionObserver', MockObserver)

let matchState: Record<string, boolean> = {}

/** Set which media queries report as matching. Call inside a test before render. */
export function setMatchMedia(matches: Record<string, boolean>) {
  matchState = matches
}

beforeEach(() => {
  matchState = {}
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: matchState[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/__tests__/lib/useMediaQuery.test.tsx
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import { useMediaQuery, usePrefersReducedMotion, useCoarsePointer } from '@/lib/useMediaQuery'

describe('useMediaQuery', () => {
  it('reports false when the query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'))
    expect(result.current).toBe(false)
  })

  it('reports true when the query matches', () => {
    setMatchMedia({ '(min-width: 900px)': true })
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'))
    expect(result.current).toBe(true)
  })
})

describe('usePrefersReducedMotion', () => {
  it('is false by default', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('is true when the user asks for reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })
})

describe('useCoarsePointer', () => {
  it('is false on a fine pointer at desktop width', () => {
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(false)
  })

  it('is true when the primary pointer is coarse', () => {
    setMatchMedia({ '(pointer: coarse)': true })
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(true)
  })

  it('is true on a narrow viewport even with a fine pointer', () => {
    setMatchMedia({ '(max-width: 767px)': true })
    const { result } = renderHook(() => useCoarsePointer())
    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/__tests__/lib/useMediaQuery.test.tsx`
Expected: FAIL — cannot resolve `@/lib/useMediaQuery`.

- [ ] **Step 4: Write `src/lib/useMediaQuery.ts`**

```ts
import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Discrete state — changes rarely, so React
 * state is correct here (unlike scroll progress, which must never be).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * True when the horizontal pans should collapse to vertical stacks.
 *
 * `(pointer: coarse)` is real primary-input detection rather than a width
 * proxy, so a touchscreen laptop driven by a trackpad still gets the pan.
 * The width clause catches narrow windows where a 3-panel pan has no room.
 * A coarse-pointer device at desktop width gets the stack, deliberately.
 */
export function useCoarsePointer(): boolean {
  const coarse = useMediaQuery('(pointer: coarse)');
  const narrow = useMediaQuery('(max-width: 767px)');
  return coarse || narrow;
}
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/__tests__/lib/useMediaQuery.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/useMediaQuery.ts src/__tests__/setup.ts src/__tests__/lib/
git commit -m "feat: add media query hooks and jsdom matchMedia mock"
```

---

### Task 4: Scroll engine

The core of the build. Continuous values in a mutable object; discrete values in zustand.

**Files:**
- Create: `src/lib/scrollStore.ts`
- Test: `src/__tests__/lib/scrollStore.test.ts`

**Interfaces:**
- Consumes: `SCENES` from `@/content/content`; `usePrefersReducedMotion` from `@/lib/useMediaQuery`.
- Produces:
  - `interface SceneProgress { progress: number; visible: boolean }`
  - `export const scrollState: { progress: number; velocity: number; scenes: SceneProgress[] }` — mutable, never React state
  - `export function computeSceneProgress(top: number, height: number, viewportHeight: number): SceneProgress`
  - `export function activeSceneFrom(scenes: SceneProgress[]): number`
  - `export const useSceneStore` — zustand store with `{ activeScene: number; reducedMotion: boolean; coarsePointer: boolean; webglSupported: boolean | null; setActiveScene; setEnv }`
  - `export function registerScene(index: number, el: HTMLElement | null): void`
  - `export function useScrollEngine(): void` — mounts Lenis + the rAF tick; called once from `App`.

- [ ] **Step 1: Install the two runtime dependencies**

```bash
npm install lenis zustand
```

- [ ] **Step 2: Write the failing test**

```ts
// src/__tests__/lib/scrollStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeSceneProgress,
  activeSceneFrom,
  scrollState,
  useSceneStore,
} from '@/lib/scrollStore'

describe('computeSceneProgress', () => {
  const VH = 800

  it('is 0 when the scene sits exactly below the fold', () => {
    expect(computeSceneProgress(800, 800, VH).progress).toBe(0)
  })

  it('is 1 when the scene has fully passed above the viewport', () => {
    expect(computeSceneProgress(-800, 800, VH).progress).toBe(1)
  })

  it('is 0.5 at the midpoint of its travel', () => {
    // travel = vh + height = 1600; midpoint when vh - top = 800 -> top = 0
    expect(computeSceneProgress(0, 800, VH).progress).toBeCloseTo(0.5, 5)
  })

  it('clamps below 0 and above 1', () => {
    expect(computeSceneProgress(5000, 800, VH).progress).toBe(0)
    expect(computeSceneProgress(-5000, 800, VH).progress).toBe(1)
  })

  it('marks visibility only while some part is on screen', () => {
    expect(computeSceneProgress(799, 800, VH).visible).toBe(true)
    expect(computeSceneProgress(801, 800, VH).visible).toBe(false)
    expect(computeSceneProgress(-799, 800, VH).visible).toBe(true)
    expect(computeSceneProgress(-800, 800, VH).visible).toBe(false)
  })
})

describe('activeSceneFrom', () => {
  it('picks the visible scene whose progress is nearest the middle', () => {
    const scenes = [
      { progress: 0.95, visible: true },
      { progress: 0.45, visible: true },
      { progress: 0.0, visible: false },
    ]
    expect(activeSceneFrom(scenes)).toBe(1)
  })

  it('falls back to the last scene it passed when nothing is visible', () => {
    const scenes = [
      { progress: 1, visible: false },
      { progress: 1, visible: false },
      { progress: 0, visible: false },
    ]
    expect(activeSceneFrom(scenes)).toBe(1)
  })
})

describe('scrollState', () => {
  it('is a plain mutable object, not React state', () => {
    scrollState.progress = 0.42
    expect(scrollState.progress).toBe(0.42)
    scrollState.progress = 0
  })
})

describe('useSceneStore', () => {
  beforeEach(() => {
    useSceneStore.setState({ activeScene: 0, reducedMotion: false, coarsePointer: false })
  })

  it('updates the active scene', () => {
    useSceneStore.getState().setActiveScene(3)
    expect(useSceneStore.getState().activeScene).toBe(3)
  })

  it('returns an identical state object when the scene has not changed', () => {
    const before = useSceneStore.getState()
    before.setActiveScene(0)
    expect(useSceneStore.getState()).toBe(before)
  })

  it('merges environment flags', () => {
    useSceneStore.getState().setEnv({ reducedMotion: true })
    expect(useSceneStore.getState().reducedMotion).toBe(true)
    expect(useSceneStore.getState().coarsePointer).toBe(false)
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/__tests__/lib/scrollStore.test.ts`
Expected: FAIL — cannot resolve `@/lib/scrollStore`.

- [ ] **Step 4: Write `src/lib/scrollStore.ts`**

```ts
import { useEffect } from 'react';
import Lenis from 'lenis';
import { create } from 'zustand';
import { SCENES } from '@/content/content';
import { usePrefersReducedMotion, useCoarsePointer } from '@/lib/useMediaQuery';

export interface SceneProgress {
  /** 0 before the scene enters the viewport, 1 once it has fully left. */
  progress: number;
  visible: boolean;
}

/**
 * CONTINUOUS SCROLL STATE — a plain mutable object, deliberately NOT React
 * state and deliberately NOT in zustand.
 *
 * This is updated in place once per animation frame. Consumers read it
 * imperatively (R3F's useFrame, Framer Motion transforms). If this lived in
 * reactive state, every subscriber would re-render 60 times a second, which
 * is exactly the jank a cinematic scroll cannot survive.
 */
export const scrollState: {
  progress: number;
  velocity: number;
  scenes: SceneProgress[];
} = {
  progress: 0,
  velocity: 0,
  scenes: SCENES.map(() => ({ progress: 0, visible: false })),
};

/**
 * Progress of one scene through the viewport.
 * Travel spans from "top edge at the bottom of the viewport" (0) to
 * "bottom edge at the top of the viewport" (1).
 */
export function computeSceneProgress(
  top: number,
  height: number,
  viewportHeight: number,
): SceneProgress {
  const travel = viewportHeight + height;
  const raw = travel === 0 ? 0 : (viewportHeight - top) / travel;
  const progress = Math.min(1, Math.max(0, raw));
  const visible = top < viewportHeight && top + height > 0;
  return { progress, visible };
}

/** The scene a reader is most plausibly looking at. */
export function activeSceneFrom(scenes: SceneProgress[]): number {
  let best = -1;
  let bestDistance = Infinity;

  scenes.forEach((scene, i) => {
    if (!scene.visible) return;
    const distance = Math.abs(scene.progress - 0.5);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });

  if (best !== -1) return best;

  // Nothing visible (between scenes, or mid-jump): the last one fully passed.
  let lastPassed = 0;
  scenes.forEach((scene, i) => {
    if (scene.progress >= 1) lastPassed = i;
  });
  return lastPassed;
}

interface SceneStore {
  activeScene: number;
  reducedMotion: boolean;
  coarsePointer: boolean;
  webglSupported: boolean | null;
  setActiveScene: (index: number) => void;
  setEnv: (patch: Partial<Pick<SceneStore, 'reducedMotion' | 'coarsePointer' | 'webglSupported'>>) => void;
}

/**
 * DISCRETE STATE ONLY. Everything here changes rarely — a handful of times
 * across a whole scroll. Nothing that changes per frame belongs in this store.
 */
export const useSceneStore = create<SceneStore>((set) => ({
  activeScene: 0,
  reducedMotion: false,
  coarsePointer: false,
  webglSupported: null,
  setActiveScene: (index) =>
    set((state) => (state.activeScene === index ? state : { ...state, activeScene: index })),
  setEnv: (patch) => set((state) => ({ ...state, ...patch })),
}));

const sceneElements: (HTMLElement | null)[] = SCENES.map(() => null);

export function registerScene(index: number, el: HTMLElement | null): void {
  sceneElements[index] = el;
}

/**
 * Mounts the scroll engine. Call exactly once, from App.
 *
 * Lenis drives NATIVE document scroll rather than transforming a container,
 * so keyboard paging, find-in-page, and assistive technology keep working.
 * Under prefers-reduced-motion Lenis never initialises and we fall back to a
 * plain scroll listener, leaving the browser's own scrolling untouched.
 */
export function useScrollEngine(): void {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const setActiveScene = useSceneStore((s) => s.setActiveScene);
  const setEnv = useSceneStore((s) => s.setEnv);

  useEffect(() => {
    setEnv({ reducedMotion, coarsePointer });
  }, [reducedMotion, coarsePointer, setEnv]);

  useEffect(() => {
    let lastY = window.scrollY;

    const sample = () => {
      const viewportHeight = window.innerHeight;
      const limit = document.documentElement.scrollHeight - viewportHeight;
      const y = window.scrollY;

      scrollState.progress = limit > 0 ? y / limit : 0;
      scrollState.velocity = y - lastY;
      lastY = y;

      sceneElements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        scrollState.scenes[i] = computeSceneProgress(rect.top, rect.height, viewportHeight);
      });

      setActiveScene(activeSceneFrom(scrollState.scenes));
    };

    if (reducedMotion) {
      sample();
      window.addEventListener('scroll', sample, { passive: true });
      window.addEventListener('resize', sample);
      return () => {
        window.removeEventListener('scroll', sample);
        window.removeEventListener('resize', sample);
      };
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      sample();
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion, setActiveScene]);
}
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/__tests__/lib/scrollStore.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/scrollStore.ts src/__tests__/lib/scrollStore.test.ts
git commit -m "feat: add scroll engine with mutable continuous state and discrete store"
```

---

### Task 5: SceneFrame

The shared wrapper every scene sits in: registers itself with the scroll engine, paints the dusk ground and grain, and provides the letterbox.

**Files:**
- Create: `src/components/SceneFrame.tsx`
- Test: `src/__tests__/components/SceneFrame.test.tsx`

**Interfaces:**
- Consumes: `registerScene` from `@/lib/scrollStore`; `SCENES` from `@/content/content`.
- Produces: `<SceneFrame index={number} id={string} label={string} letterbox?: boolean className?: string>` rendering a `<section>` with `id`, `aria-label`, and `data-scene={index}`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/SceneFrame.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SceneFrame from '@/components/SceneFrame'

describe('SceneFrame', () => {
  it('renders as a labelled landmark carrying its scene index', () => {
    render(<SceneFrame index={2} id="work" label="Work"><p>body</p></SceneFrame>)
    const section = screen.getByRole('region', { name: 'Work' })
    expect(section).toHaveAttribute('id', 'work')
    expect(section).toHaveAttribute('data-scene', '2')
  })

  it('renders its children', () => {
    render(<SceneFrame index={0} id="cold-open" label="Cold Open"><p>hello</p></SceneFrame>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('hides decorative layers from assistive technology', () => {
    const { container } = render(
      <SceneFrame index={0} id="cold-open" label="Cold Open"><p>hi</p></SceneFrame>,
    )
    const decorations = container.querySelectorAll('[data-decoration]')
    expect(decorations.length).toBeGreaterThan(0)
    decorations.forEach((d) => expect(d).toHaveAttribute('aria-hidden', 'true'))
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/components/SceneFrame.test.tsx`
Expected: FAIL — cannot resolve `@/components/SceneFrame`.

- [ ] **Step 3: Write `src/components/SceneFrame.tsx`**

```tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { registerScene } from '@/lib/scrollStore';

interface SceneFrameProps {
  index: number;
  id: string;
  label: string;
  children: ReactNode;
  /** Black bars top and bottom — the cinematic frame. */
  letterbox?: boolean;
  /** Opacity of the dusk gradient, 0–1. Scenes vary this for depth. */
  duskOpacity?: number;
  className?: string;
}

/**
 * Shared scene wrapper. Registers the section with the scroll engine so its
 * progress is sampled each frame, and paints the two decorative layers every
 * scene shares: the dusk gradient and the film grain. Both are aria-hidden —
 * no decoration ever carries information.
 */
export const SceneFrame = ({
  index,
  id,
  label,
  children,
  letterbox = false,
  duskOpacity = 1,
  className = '',
}: SceneFrameProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerScene(index, ref.current);
    return () => registerScene(index, null);
  }, [index]);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-scene={index}
      className={`relative isolate overflow-hidden bg-background ${className}`}
    >
      <div
        data-decoration="dusk"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dusk-bg"
        style={{ opacity: duskOpacity }}
      />
      <div
        data-decoration="grain"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '150px 150px',
        }}
      />
      {letterbox && (
        <>
          <div data-decoration="bar-top" aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[6vh] bg-[hsl(258_45%_4%)]" />
          <div data-decoration="bar-bottom" aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[6vh] bg-[hsl(258_45%_4%)]" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default SceneFrame;
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/__tests__/components/SceneFrame.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/SceneFrame.tsx src/__tests__/components/SceneFrame.test.tsx
git commit -m "feat: add SceneFrame wrapper with dusk ground and grain"
```

---

### Task 6: Scene 0 — Cold Open

**Files:**
- Create: `src/scenes/Scene0_TitleCard.tsx`
- Create: `src/motion/variants.ts`
- Test: `src/__tests__/scenes/Scene0.test.tsx`

**Interfaces:**
- Consumes: `SceneFrame`; `content.identity`; `usePrefersReducedMotion`.
- Produces: `EASE`, `DURATION`, `riseItem`, `staggerParent`, `lineRise` from `@/motion/variants`; default-exported `Scene0TitleCard`.

- [ ] **Step 1: Write `src/motion/variants.ts`**

```ts
import type { Variants } from 'framer-motion';

/** Mirrors --ease-cinematic. A strong ease-out settle. Never springy. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = { reveal: 0.7, line: 0.8, rule: 0.6 } as const;

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE } },
};

/** Masked line: translates up from behind an overflow-hidden clip. */
export const lineRise: Variants = {
  hidden: { y: '115%' },
  visible: { y: '0%', transition: { duration: DURATION.line, ease: EASE } },
};

export const inView = { once: true, margin: '0px 0px -12% 0px' } as const;
```

- [ ] **Step 2: Write the failing test**

```tsx
// src/__tests__/scenes/Scene0.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import Scene0TitleCard from '@/scenes/Scene0_TitleCard'
import { content } from '@/content/content'

describe('Scene 0 — Cold Open', () => {
  it('renders the name as the page heading', () => {
    render(<Scene0TitleCard />)
    expect(
      screen.getByRole('heading', { level: 1, name: /sydney kamau/i }),
    ).toBeInTheDocument()
  })

  it('renders role, location and coordinates', () => {
    render(<Scene0TitleCard />)
    expect(screen.getByText(new RegExp(content.identity.role, 'i'))).toBeInTheDocument()
    expect(screen.getByText(/nairobi/i)).toBeInTheDocument()
    expect(screen.getByText(content.identity.coords)).toBeInTheDocument()
  })

  it('renders all its content under reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    render(<Scene0TitleCard />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(content.identity.coords)).toBeInTheDocument()
  })

  it('sits inside a labelled scene landmark', () => {
    render(<Scene0TitleCard />)
    expect(screen.getByRole('region', { name: 'Cold Open' })).toHaveAttribute('data-scene', '0')
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/__tests__/scenes/Scene0.test.tsx`
Expected: FAIL — cannot resolve `@/scenes/Scene0_TitleCard`.

- [ ] **Step 4: Write `src/scenes/Scene0_TitleCard.tsx`**

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SceneFrame from '@/components/SceneFrame';
import { content } from '@/content/content';
import { usePrefersReducedMotion } from '@/lib/useMediaQuery';
import { staggerParent, riseItem } from '@/motion/variants';

/**
 * Scene 0 — the cold open. A scroll-linked perspective push-in: the title
 * grows and recedes on z while sky, sun, ridge and title move at four
 * different rates. Under reduced motion every transform resolves to its
 * resting value and the scene reads as a static title card.
 */
export const Scene0TitleCard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const titleFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const sunY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  const still = { scale: 1, y: '0%', opacity: 1 };
  const titleStyle = reduce ? still : { scale: titleScale, y: titleY, opacity: titleFade };

  return (
    <SceneFrame index={0} id="cold-open" label="Cold Open" letterbox>
      <div ref={ref} className="relative flex h-screen flex-col items-center justify-center">
        {/* Sun — midground */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: sunY }}
          className="pointer-events-none absolute right-[14%] top-[18%] h-40 w-40 rounded-full blur-[2px]"
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,hsl(38_100%_74%)_0%,hsl(var(--amber))_52%,transparent_74%)]" />
        </motion.div>

        {/* Ridge — foreground */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: ridgeY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] bg-[hsl(258_45%_5%)]"
          data-testid="ridge"
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="visible"
          className="pointer-events-none absolute inset-0"
        >
          <motion.div variants={riseItem} className="kicker absolute left-8 top-[8vh]">
            I — COLD OPEN
          </motion.div>
          <motion.div
            variants={riseItem}
            className="kicker-muted absolute right-8 top-[8vh]"
          >
            {content.identity.coords}
          </motion.div>
          <motion.div
            variants={riseItem}
            className="kicker-muted absolute bottom-[10vh] left-0 right-0 text-center"
          >
            {content.identity.role} — {content.identity.location}
          </motion.div>
        </motion.div>

        <motion.h1
          style={titleStyle}
          className="display relative z-10 text-center text-[clamp(3rem,13vw,var(--step-8))] text-foreground"
        >
          {content.identity.name.split(' ').map((word) => (
            <span key={word} className="block">
              {word.toUpperCase()}
            </span>
          ))}
        </motion.h1>
      </div>
    </SceneFrame>
  );
};

export default Scene0TitleCard;
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/__tests__/scenes/Scene0.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/scenes/Scene0_TitleCard.tsx src/motion/variants.ts src/__tests__/scenes/Scene0.test.tsx
git commit -m "feat: add Scene 0 cold open with scroll-linked push-in"
```

---

### Task 7: Scene 1 — Personal

The riskiest motion pattern in the build. A tall section with a sticky inner track; vertical scroll drives `translateX`. Collapses to a vertical stack on coarse pointer.

**Files:**
- Create: `src/scenes/Scene1_Personal.tsx`
- Test: `src/__tests__/scenes/Scene1.test.tsx`

**Interfaces:**
- Consumes: `SceneFrame`; `content.scene1`; `useCoarsePointer`, `usePrefersReducedMotion`.
- Produces: default-exported `Scene1Personal`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/scenes/Scene1.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { setMatchMedia } from '../setup'
import Scene1Personal from '@/scenes/Scene1_Personal'
import { content } from '@/content/content'

describe('Scene 1 — Personal', () => {
  it('renders all three panels', () => {
    render(<Scene1Personal />)
    for (const panel of content.scene1.panels) {
      expect(screen.getByText(panel.heading.join(' '))).toBeInTheDocument()
    }
  })

  it('renders every stack group and every item in the rail', () => {
    render(<Scene1Personal />)
    const rail = screen.getByRole('list', { name: /technical stack/i })
    for (const group of content.scene1.stack) {
      expect(within(rail).getByText(group.group)).toBeInTheDocument()
      for (const item of group.items) {
        expect(within(rail).getByText(item)).toBeInTheDocument()
      }
    }
  })

  it('uses a horizontal track on a fine pointer at desktop width', () => {
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'horizontal')
  })

  it('collapses to a vertical stack on a coarse pointer', () => {
    setMatchMedia({ '(pointer: coarse)': true })
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'stacked')
  })

  it('collapses to a vertical stack on a narrow viewport', () => {
    setMatchMedia({ '(max-width: 767px)': true })
    render(<Scene1Personal />)
    expect(screen.getByTestId('scene1-track')).toHaveAttribute('data-layout', 'stacked')
  })

  it('still renders every panel under reduced motion', () => {
    setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
    render(<Scene1Personal />)
    for (const panel of content.scene1.panels) {
      expect(screen.getByText(panel.heading.join(' '))).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/scenes/Scene1.test.tsx`
Expected: FAIL — cannot resolve `@/scenes/Scene1_Personal`.

- [ ] **Step 3: Write `src/scenes/Scene1_Personal.tsx`**

Note the heading markup: each panel's `heading` array is joined with spaces into the accessible name via a single `<h2>`, with visual line breaks done by `<span className="block">`. That is why the test queries `panel.heading.join(' ')`.

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SceneFrame from '@/components/SceneFrame';
import { content } from '@/content/content';
import { useCoarsePointer, usePrefersReducedMotion } from '@/lib/useMediaQuery';

const PANELS = content.scene1.panels;

const StackRail = () => (
  <ul
    aria-label="Technical stack"
    className="grid gap-6 sm:grid-cols-2"
  >
    {content.scene1.stack.map((group) => (
      <li key={group.group}>
        <div className="kicker mb-3">{group.group}</div>
        <div className="flex flex-wrap gap-2">
          {group.items.map((item) => (
            <span
              key={item}
              className="border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </li>
    ))}
  </ul>
);

const Panel = ({ index }: { index: number }) => {
  const panel = PANELS[index];
  return (
    <div className="relative flex h-screen w-screen shrink-0 flex-col justify-center px-8 md:px-20">
      <div aria-hidden="true"
        className="display pointer-events-none absolute -bottom-16 right-0 text-[28vw] leading-none text-foreground/[0.045]">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="kicker mb-6">{panel.kicker}</div>
      <h2 className="display max-w-3xl text-[clamp(2.2rem,7vw,var(--step-6))] text-foreground">
        {panel.heading.map((line, i) => (
          <span key={line} className="block">
            {line}
            {i < panel.heading.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h2>
      {panel.body && (
        <p className="mt-8 max-w-xl text-[length:var(--step-0)] leading-relaxed text-muted-foreground">
          {panel.body}
        </p>
      )}
      {index === PANELS.length - 1 && (
        <div className="mt-10 max-w-3xl">
          <StackRail />
        </div>
      )}
    </div>
  );
};

/**
 * Scene 1 — Personal. Three panels panned horizontally by vertical scroll.
 *
 * This is scroll-LINKED, not scroll-jacked: the section is simply tall, an
 * inner track is sticky, and translateX is derived from the section's own
 * scroll progress. No wheel/touch/key event is ever intercepted, so keyboard
 * paging, find-in-page and screen readers behave normally.
 */
export const Scene1Personal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const stacked = useCoarsePointer();
  const reduce = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const shift = -100 * (PANELS.length - 1);
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${shift}%`]);

  if (stacked || reduce) {
    return (
      <SceneFrame index={1} id="personal" label="Personal" duskOpacity={0.55}>
        <div ref={ref} data-testid="scene1-track" data-layout="stacked">
          {PANELS.map((panel, i) => (
            <Panel key={panel.kicker} index={i} />
          ))}
        </div>
      </SceneFrame>
    );
  }

  return (
    <SceneFrame index={1} id="personal" label="Personal" duskOpacity={0.55}>
      <div ref={ref} style={{ height: `${PANELS.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            data-testid="scene1-track"
            data-layout="horizontal"
            style={{ x }}
            className="flex h-full"
          >
            {PANELS.map((panel, i) => (
              <Panel key={panel.kicker} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </SceneFrame>
  );
};

export default Scene1Personal;
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/__tests__/scenes/Scene1.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/scenes/Scene1_Personal.tsx src/__tests__/scenes/Scene1.test.tsx
git commit -m "feat: add Scene 1 personal with scroll-linked horizontal pan"
```

---

### Task 8: Nav dots and progress bar

Chrome driven by discrete state only — six re-renders across a full scroll, not sixty per second.

**Files:**
- Create: `src/components/NavDots.tsx`
- Create: `src/components/ProgressBar.tsx`
- Test: `src/__tests__/components/NavDots.test.tsx`

**Interfaces:**
- Consumes: `SCENES`; `useSceneStore`; `scrollState`.
- Produces: default-exported `NavDots` and `ProgressBar`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/components/NavDots.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NavDots from '@/components/NavDots'
import ProgressBar from '@/components/ProgressBar'
import { useSceneStore } from '@/lib/scrollStore'
import { SCENES } from '@/content/content'

describe('NavDots', () => {
  beforeEach(() => useSceneStore.setState({ activeScene: 0 }))

  it('renders one labelled link per scene', () => {
    render(<NavDots />)
    const nav = screen.getByRole('navigation', { name: /scenes/i })
    expect(nav).toBeInTheDocument()
    for (const scene of SCENES) {
      expect(screen.getByRole('link', { name: scene.label })).toHaveAttribute(
        'href', `#${scene.id}`,
      )
    }
  })

  it('marks only the active scene as current', () => {
    useSceneStore.setState({ activeScene: 3 })
    render(<NavDots />)
    const current = screen.getAllByRole('link').filter(
      (a) => a.getAttribute('aria-current') === 'true',
    )
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName(SCENES[3].label)
  })
})

describe('ProgressBar', () => {
  it('is decorative and hidden from assistive technology', () => {
    const { container } = render(<ProgressBar />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/components/NavDots.test.tsx`
Expected: FAIL — cannot resolve `@/components/NavDots`.

- [ ] **Step 3: Write `src/components/NavDots.tsx`**

```tsx
import { useSceneStore } from '@/lib/scrollStore';
import { SCENES } from '@/content/content';

/**
 * Scene navigation. Real anchors, so keyboard and screen-reader users get a
 * working table of contents rather than decorative dots. Subscribes only to
 * activeScene — discrete state that changes about six times per full scroll.
 */
export const NavDots = () => {
  const activeScene = useSceneStore((s) => s.activeScene);

  return (
    <nav
      aria-label="Scenes"
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:block"
    >
      <ul className="flex flex-col gap-4">
        {SCENES.map((scene) => {
          const active = scene.index === activeScene;
          return (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                aria-current={active ? 'true' : undefined}
                className="group flex items-center justify-end gap-3"
              >
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-opacity duration-300 ${
                    active ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {scene.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-300 ${
                    active ? 'w-7 bg-primary' : 'w-3.5 bg-muted-foreground/50 group-hover:w-5'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavDots;
```

- [ ] **Step 4: Write `src/components/ProgressBar.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { scrollState } from '@/lib/scrollStore';

/**
 * Scroll progress rule. Reads the mutable scrollState imperatively inside its
 * own rAF loop and writes straight to the DOM node's transform — it never
 * holds progress in React state, so it causes zero re-renders.
 */
export const ProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${scrollState.progress})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div
        ref={barRef}
        className="h-full origin-left bg-primary"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};

export default ProgressBar;
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/__tests__/components/NavDots.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/NavDots.tsx src/components/ProgressBar.tsx src/__tests__/components/NavDots.test.tsx
git commit -m "feat: add nav dots and progress bar driven by discrete state"
```

---

### Task 9: App shell — retire the router and the pages

The cutover. Scenes 2–5 land as labelled stub sections so the scroll spine is complete end to end and nav dots have real targets; later stages fill them in.

**Files:**
- Rewrite: `src/App.tsx`
- Create: `src/scenes/SceneStub.tsx`
- Modify: `vercel.json`
- Modify: `src/__tests__/security/input-sanitization.test.ts:37-56`
- Delete: `src/pages/`, `src/components/Layout.tsx`, `src/components/Navigation.tsx`, `src/components/ThemeProvider.tsx`, `src/components/ThemeToggle.tsx`, `src/components/PageHeader.tsx`, `src/components/Footer.tsx`, `src/components/BlurText.tsx`, `src/components/RevealHeading.tsx`, `src/components/SectionLabel.tsx`, `src/App.css`
- Test: `src/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: `Scene0TitleCard`, `Scene1Personal`, `SceneStub`, `NavDots`, `ProgressBar`, `useScrollEngine`, `SCENES`.
- Produces: default-exported `App` rendering six `data-scene` sections in order.

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/App.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { SCENES } from '@/content/content'

describe('App', () => {
  it('renders all six scenes in order as labelled landmarks', () => {
    const { container } = render(<App />)
    const sections = Array.from(container.querySelectorAll('[data-scene]'))
    expect(sections).toHaveLength(6)
    sections.forEach((section, i) => {
      expect(section).toHaveAttribute('data-scene', String(i))
      expect(section).toHaveAttribute('id', SCENES[i].id)
    })
  })

  it('renders the scene navigation', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: /scenes/i })).toBeInTheDocument()
  })

  it('renders the cold open heading as the single h1', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: FAIL — the current `App` renders a router, not `data-scene` sections.

- [ ] **Step 3: Write `src/scenes/SceneStub.tsx`**

```tsx
import SceneFrame from '@/components/SceneFrame';

/**
 * Placeholder for a scene not yet built. Renders as a real labelled landmark
 * with its title so the scroll spine, nav dots, and scene progress sampling
 * all work end to end before Stages 2–4 fill these in.
 */
export const SceneStub = ({
  index,
  id,
  label,
  numeral,
}: {
  index: number;
  id: string;
  label: string;
  numeral: string;
}) => (
  <SceneFrame index={index} id={id} label={label} duskOpacity={0.4}>
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <div className="kicker">{numeral} — {label.toUpperCase()}</div>
      <h2 className="display text-[clamp(2rem,6vw,var(--step-5))] text-foreground/25">
        {label}
      </h2>
      <p className="kicker-muted">In production</p>
    </div>
  </SceneFrame>
);

export default SceneStub;
```

- [ ] **Step 4: Rewrite `src/App.tsx`**

```tsx
import Scene0TitleCard from '@/scenes/Scene0_TitleCard';
import Scene1Personal from '@/scenes/Scene1_Personal';
import SceneStub from '@/scenes/SceneStub';
import NavDots from '@/components/NavDots';
import ProgressBar from '@/components/ProgressBar';
import { useScrollEngine } from '@/lib/scrollStore';
import { SCENES } from '@/content/content';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const App = () => {
  useScrollEngine();

  return (
    <>
      <ProgressBar />
      <NavDots />
      <main>
        <Scene0TitleCard />
        <Scene1Personal />
        {SCENES.slice(2).map((scene) => (
          <SceneStub
            key={scene.id}
            index={scene.index}
            id={scene.id}
            label={scene.label}
            numeral={NUMERALS[scene.index]}
          />
        ))}
      </main>
    </>
  );
};

export default App;
```

- [ ] **Step 5: Delete the retired pages and components**

```bash
git rm -r src/pages
git rm src/components/Layout.tsx src/components/Navigation.tsx \
       src/components/ThemeProvider.tsx src/components/ThemeToggle.tsx \
       src/components/PageHeader.tsx src/components/Footer.tsx \
       src/components/BlurText.tsx src/components/RevealHeading.tsx \
       src/components/SectionLabel.tsx src/App.css
```

- [ ] **Step 6: Replace `vercel.json` with redirects plus a catch-all**

```json
{
    "redirects": [
        { "source": "/about", "destination": "/", "permanent": true },
        { "source": "/skills", "destination": "/", "permanent": true },
        { "source": "/projects", "destination": "/", "permanent": true },
        { "source": "/ai-automation", "destination": "/", "permanent": true },
        { "source": "/contact", "destination": "/", "permanent": true }
    ],
    "rewrites": [
        { "source": "/(.*)", "destination": "/" }
    ]
}
```

- [ ] **Step 7: Fix the form-validation assertion**

`src/__tests__/security/input-sanitization.test.ts:55` currently asserts
`expect(hasZodValidation || hasReactHookForm).toBe(true)` — a project-wide
requirement that some file mentions zod or react-hook-form. With no form on the
site that fails. The test's intent is "forms must be validated", not "this
project must contain a form", so make it conditional. Replace the body of
`it('should use schema validation for forms', ...)` with:

```ts
        it('should use schema validation for forms', () => {
            let hasZodValidation = false
            let hasReactHookForm = false
            let hasForm = false

            for (const file of tsxFiles) {
                const content = readFileSync(file, 'utf-8')

                if (content.includes('<form') || content.includes('useForm')) {
                    hasForm = true
                }

                if (content.includes('zod') || content.includes('z.object') || content.includes('z.string')) {
                    hasZodValidation = true
                }

                if (content.includes('react-hook-form') || content.includes('useForm')) {
                    hasReactHookForm = true
                }
            }

            // Any form the project ships must be schema-validated. A project
            // with no forms at all trivially satisfies that.
            if (hasForm) {
                expect(hasZodValidation || hasReactHookForm).toBe(true)
            } else {
                expect(hasForm).toBe(false)
            }
        })
```

- [ ] **Step 8: Run the whole suite**

Run: `npx vitest run src/__tests__/App.test.tsx src/__tests__/security/ src/__tests__/scenes/ src/__tests__/components/`
Expected: PASS. `bundle-size.test.ts` is not in this list — it is rewritten in Stage 4 and may fail until then.

- [ ] **Step 9: Verify the app actually builds and runs**

Run: `npm run build`
Expected: build succeeds with no unresolved imports. If anything still imports a deleted page or `react-router-dom`, fix the import rather than restoring the file.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: replace router with single-page scroll spine"
```

---

### Task 10: Dependency prune

Removes what the pages, router, and contact form stranded. Done last so every removal is verified against a green suite.

**Files:**
- Modify: `package.json`
- Delete: unused files under `src/components/ui/`
- Test: `src/__tests__/design/deps.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing importable — this task only removes.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/design/deps.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

describe('dependencies', () => {
  it('has the scroll engine installed', () => {
    expect(deps).toHaveProperty('lenis')
    expect(deps).toHaveProperty('zustand')
    expect(deps).toHaveProperty('framer-motion')
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

  it('has not installed the 3D stack yet — that is Stage 3', () => {
    expect(deps).not.toHaveProperty('three')
    expect(deps).not.toHaveProperty('@react-three/fiber')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx vitest run src/__tests__/design/deps.test.ts`
Expected: FAIL — `react-router-dom` and the rest are still present.

- [ ] **Step 3: Find which `ui/` files are still imported**

```bash
for f in src/components/ui/*.tsx src/components/ui/*.ts; do
  name=$(basename "$f" | sed 's/\.[^.]*$//')
  hits=$(grep -rl "components/ui/$name" src --include=*.tsx --include=*.ts | grep -v "^src/components/ui/" | wc -l)
  if [ "$hits" -eq 0 ]; then echo "UNUSED $f"; fi
done
```

- [ ] **Step 4: Delete every file the previous step reported, then repeat it**

`ui/` files import each other, so deleting one round can strand another. Re-run
Step 3 and delete again until it reports nothing. Keep any file still imported
by a scene or component.

- [ ] **Step 5: Uninstall the stranded packages**

```bash
npm uninstall react-router-dom recharts @tanstack/react-query \
  react-hook-form @hookform/resolvers embla-carousel-react \
  react-day-picker date-fns cmdk vaul input-otp \
  react-resizable-panels next-themes sonner
```

Then uninstall each `@radix-ui/*` package whose `ui/` file was deleted. Check
before each removal:

```bash
grep -rl "@radix-ui/react-<name>" src | grep -v node_modules
```

Remove `zod` only if nothing references it and
`src/__tests__/security/input-sanitization.test.ts` still passes.

- [ ] **Step 6: Run the full suite and the build**

Run: `npx vitest run src/__tests__/design/ src/__tests__/content/ src/__tests__/lib/ src/__tests__/scenes/ src/__tests__/components/ src/__tests__/App.test.tsx src/__tests__/security/`
Then: `npm run build`
Expected: both green. Any failure means a package was removed that something still imports — restore that one package and note it.

- [ ] **Step 7: Record what actually came out**

Append to the plan file a short list of the packages removed and the resulting
`dist` size from `npm run build`, so Stage 4's bundle-test rewrite has a real
baseline. The spec deliberately promised no number up front.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: prune dependencies stranded by the router and page removal"
```

---

## Verification

After Task 10, Stage 1 is done when all of the following hold:

- [ ] `npm run build` succeeds.
- [ ] `npx vitest run` passes except `speed/bundle-size.test.ts`, which is knowingly deferred to Stage 4.
- [ ] `npm run dev` shows: cold open with the push-in, a three-panel horizontal pan, four stub scenes, working nav dots, and a progress rule.
- [ ] Narrowing the window under 768px collapses Scene 1 to a vertical stack.
- [ ] Enabling reduced motion at the OS level disables smooth scrolling and renders every scene statically and completely.
- [ ] Tabbing through the page reaches all six nav links and every scene's content in order.
- [ ] `grep -r "794 817 115\|+254" src/ index.html` returns nothing.
