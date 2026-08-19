# Cinematic Scroll Portfolio — Design

**Date:** 2026-08-19
**Repo:** `sydney-forge-ai`
**Status:** Approved for staged implementation

Converts the existing multi-page portfolio into a single continuous cinematic
scroll of six scenes, two of which are real WebGL. Conversion happens in place:
the toolchain, deploy config, and test suite stay; the routing and page layer are
replaced.

---

## 1. Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Scaffold | Convert this repo in place | Keeps Vite/TS/Tailwind toolchain, Vitest suite, and Vercel config. The build plan's `npm create vite` would discard all of it. |
| Scene 2 content | The CV's four projects, framed by Invonics | The CV is the newest source and the only one with verifiable detail. The plan's Grand Platform, Risiti, and the Eclectics attachment appear in no source I can read, so they are out rather than invented. |
| Art direction | Nairobi Dusk palette × Title Card typography, weighted | Chosen from three mocked directions, then refined. Poster-weight display resolves the didone-hairline risk on a dark, grained ground. |
| Routing | One URL; old paths redirect to `/` | Removes `react-router-dom` entirely and leaves one source of content truth. |
| Technical skills | A monospace stack rail inside Scene 1 | Keeps the six-scene map intact without handing a whole scene to a list. |
| Scene 3 | Keep, with WebGL as planned | The only non-professional beat on the page; a single sphere is cheap next to Scene 2's node graph. |
| Contact | Email, GitHub, Invonics. **No phone number.** | A CV goes to named recipients; a public page goes to scrapers. |
| Build order | Full spec now, four approved stages | Architecture decided end to end; no rework mid-build. |

### Deliberate departures from the build plan

1. **zustand's role is narrowed.** The plan says zustand keeps Framer Motion and
   R3F in sync. Continuous scroll progress must not live in reactive state — every
   subscriber would re-render every frame. Continuous values live in a mutable
   module object; zustand holds discrete state only. See §3.
2. **`@react-three/drei` is not installed up front.** It earns its place per
   helper or not at all. Two simple scenes do not obviously need it, and it is
   large and easy to over-import.
3. **Scene 4 widens from "Certificates" to "Credentials"**, so education and the
   Quantium/Datacom simulations have somewhere to live.
4. **"Scroll-jacked" is a misnomer for what gets built.** The horizontal scenes
   are scroll-*linked* via a tall section with a sticky inner track. No scroll
   event is ever intercepted, which is why the plan's keyboard/screen-reader risk
   largely dissolves.

---

## 2. Art direction

Single committed look. No light mode, no theme toggle — `next-themes`,
`ThemeProvider`, and `ThemeToggle` are removed.

### Palette

| Token | Hex | HSL | Role |
|---|---|---|---|
| `--ground` | `#0E0B18` | `254 37% 7%` | Page ground |
| `--ground-raised` | `#171029` | `257 44% 11%` | Cards, panels |
| `--ground-lifted` | `#241640` | `260 49% 17%` | Top of dusk gradient, elevated surfaces |
| `--ink` | `#F2EDE4` | `38 35% 92%` | Primary text |
| `--ink-muted` | `#9A8FB0` | `260 17% 63%` | Secondary text, meta |
| `--amber` | `#FF8A3D` | `24 100% 62%` | Accent: light source, active state, rules |
| `--gold` | `#F2C14E` | `42 86% 63%` | Secondary accent, sparing |

Declared as HSL triplets so the existing `hsl(var(--x))` Tailwind pattern keeps
working.

**Dusk gradient** (the signature; reused per scene at varying opacity):

```css
radial-gradient(120% 85% at 80% 6%,
  hsl(24 100% 62% / .40) 0%, hsl(42 86% 63% / .12) 28%, transparent 64%),
linear-gradient(180deg, #241640 0%, #150E29 48%, #0E0B18 100%)
```

**Film grain** carries over from FORGE as a fixed SVG turbulence overlay. Because
the display face is poster-weight, grain runs at full `0.05` opacity without
eroding letterforms.

### Type

| Role | Family | Setting |
|---|---|---|
| Display | Bodoni Moda (variable) | `wght 700`, `font-variation-settings: 'opsz' 24` |
| Meta / eyebrow | IBM Plex Mono | 400/500, `letter-spacing: .18em`, uppercase |
| Body | Inter Tight | 400/500/600 |

Scale is a perfect fourth (1.333) with Title Card's large jumps. Display steps use
`clamp()` against the viewport.

```
--step--1  0.75rem   12.0px   meta, eyebrow
--step-0   1rem      16.0px   body
--step-1   1.333rem  21.3px   lead body
--step-2   1.777rem  28.4px   card title
--step-3   2.369rem  37.9px   sub-head
--step-4   3.157rem  50.5px   project name
--step-5   4.209rem  67.3px   panel head
--step-6   5.61rem   89.8px   scene title
--step-7   7.478rem  119.6px  scene title, large
--step-8   9.969rem  159.5px  cold open
```

Border radius stays `0` throughout, carried over from FORGE.

**Font loading.** Google Fonts via `<link>` in `index.html` with `preconnect` to
both `fonts.googleapis.com` and `fonts.gstatic.com` (the latter `crossorigin`),
`display=swap`, latin subset. This is required, not cosmetic:
`src/__tests__/security/headers.test.ts` asserts preconnect hints and the
`crossorigin` attribute on fonts, and
`src/__tests__/speed/core-web-vitals.test.ts` asserts critical fonts are
preloaded and that `font-display` is set.

---

## 3. Architecture

### The scroll pipeline

```
Lenis (interpolates wheel/touch/key) → native window.scrollY
                    │
                    ▼
   lib/scrollStore.ts — one rAF tick, mutates in place
   scrollState = { progress, velocity, scenes: SceneProgress[] }
                    │
        ┌───────────┼───────────────┐
        ▼           ▼               ▼
  Framer Motion   R3F useFrame    zustand
  useScroll/      reads           discrete only:
  useTransform    scrollState     activeScene,
  (2.5D scenes)   imperatively    webglOK,
                  (never          reducedMotion
                  subscribes)
```

Lenis drives **native document scroll** rather than transforming a container.
Keyboard paging, find-in-page, and assistive-technology navigation therefore keep
working unmodified.

### State split — the critical rule

**Continuous values are never React state.** `scrollState` is a module-level
mutable object updated once per frame. `useFrame` reads it directly; Framer
Motion reads native scroll through `useScroll({ target })` per scene, which stays
in lockstep with Lenis for free.

**zustand holds only what changes rarely:** `activeSceneIndex` (~6 changes per
full scroll), `webglSupported`, `reducedMotion`, `coarsePointer`. Nav dots and
fallback branches subscribe here; nothing subscribes at frame rate.

### Horizontal pan technique (Scenes 1 and 3)

A section of height `100vh × panelCount` containing a `sticky top-0 h-screen`
track. `useScroll` on the section drives `useTransform` on the track's
`translateX`. Native vertical scroll throughout; no event interception.

### Canvas lifecycle

- Each `<Canvas>` is a `React.lazy` chunk.
- Mounted by IntersectionObserver one viewport before its scene; unmounted one
  viewport after.
- `frameloop="never"` until the scene is actually on screen.
- Two canvases in source; at most one in the DOM; zero GPU cost when unseen.

### Invariants

These are load-bearing and must not erode:

1. **No canvas is ever the sole carrier of information.** Every `<Canvas>` is
   `aria-hidden="true"`. Any text rendered in 3D — notably the Scene 2 node
   labels — is mirrored in real DOM, visible or `sr-only`. Asserted by test.
2. **Nothing subscribes to scroll progress through React state.**
3. **Every scene renders complete and legible with motion disabled**, with WebGL
   unavailable, and at coarse-pointer widths.

### Degradation

| Condition | Detection | Behaviour |
|---|---|---|
| `prefers-reduced-motion` | `matchMedia`, once, into zustand | Lenis never initialises; every scroll-linked transform resolves to its end value; page reads as a normal vertical document |
| No WebGL / weak GPU | Context probe for `webgl2` then `webgl`; treated as unsupported if neither returns a context, **or** if `navigator.deviceMemory` is present and `<= 2`. Evaluated once at mount, cached in zustand. | Scenes 2 and 3 render a still poster from `content.ts`; all copy and layout identical |
| Coarse pointer | `matchMedia('(pointer: coarse)')` **or** viewport `< md`, with a change listener | Horizontal pans collapse to vertical reveals |

`(pointer: coarse)` is real primary-input detection rather than a width proxy, so
a touchscreen laptop driven by a trackpad still gets the pan. It remains an
approximation at the edges: a coarse-pointer device at desktop width gets the
stack, deliberately.

---

## 4. Scenes

Content is the CV's in substance. Nothing is invented.

### Scene 0 — Cold Open

- **Content:** `SYDNEY KAMAU` at `--step-8`; `FULL-STACK DEVELOPER — NAIROBI`;
  `-1.2921°, 36.8219°`; numeral `I.`
- **Motion:** scroll-linked perspective push-in — title scales 1 → 1.35 on z,
  letterbox bars retract, four parallax rates across sky, sun, ridge, title.
- **DOM only.**

### Scene 1 — Personal

Three panels on a horizontal track.

1. **Who** — Nairobi, name, the "habit of shipping" line.
2. **What** — from the CV summary: scalable web applications, automation systems,
   AI-powered platforms, across agriculture, government service delivery, and
   business automation.
3. **Stack rail** — monospace, grouped as the CV groups them: Languages
   (JavaScript, Python, SQL, HTML, CSS); Frameworks (React, Node.js, Tailwind
   CSS, Django, FastAPI); Tools (Firebase, Docker, Git/GitHub, n8n, Linux, Nginx,
   Redis, Celery, ngrok, PostgreSQL, Sentry, Cloudflare R2); Competencies
   (Full-Stack Development, REST APIs, Database Design, Debugging, Automation
   Workflows).

- **Motion:** scroll-linked horizontal pan; oversized ghosted numeral as parallax
  midground. Collapses to a vertical stack on coarse pointer.
- **DOM only.**

### Scene 2 — Work · 3D moment #1

Framed by the Invonics Technologies line, then four project nodes.

| Project | Status | Detail |
|---|---|---|
| **AssetFlow Schools** | Deployed | School asset-management platform, positioned against the Auditor-General's finding of KSh 6.6B in unaccounted assets at Kenyan public secondary schools. React, Django, PostgreSQL, Celery, Redis, Cloudflare R2. QR-code asset-tagging architecture; full product-admin audit; Sentry with structlog/Loki. |
| **Eventify** | Deployed | Event ticketing for the Kenyan market. Security audit across five attacker profiles — scalping, freeloading, offline gate-scanner reconciliation fraud. Material 3 design system; organiser-first homepage strategy. |
| **FarmAssist** | Project | AI farming companion. Node.js, Express, React, Tailwind, custom YOLOv8. Crop disease detection, weather-based recommendations, real-time data handling. |
| **Lead Generation Automation** | Project | FastAPI, HTML, CSS, JavaScript. Automated scraping and routing pipelines; cut manual workload by over 60%; Dockerised deployment. |

- **Motion:** camera dollies through four floating nodes in dusk haze with
  amber edge-light, settles, then a DOM vertical detail stack takes over.
- **3D:** canvas decorative and `aria-hidden`. Every project name, status, and
  description exists in DOM regardless of canvas state.

### Scene 3 — Hobbies · 3D moment #2

- **Content:** football and FIFA; the "strategy and optimization don't stop at
  the keyboard" beat.
- **Motion:** a single sphere as fixed anchor, rotating and bouncing on scroll
  velocity; content wipes past it as a horizontal filmstrip.
- **3D:** one sphere, one material, `aria-hidden`. Filmstrip is DOM.

### Scene 4 — Credentials

Five cards:

1. BSc Computer Science — Multimedia University of Kenya, 2024–present
2. Certificate in Full Stack Development — Emobilis, 2024
3. President's Award Kenya — Gold Level, Chairman (Western Region)
4. Quantium — data-driven pricing analysis application
5. Datacom — AI tools for debugging and system design

- **Motion:** trigger-based (`whileInView`, `once`). Cards drop and settle with
  slight rotation and a clip-path reveal, staggered. The dusk gradient on each
  card catches light differently as it rotates in.
- **DOM only.**

### Scene 5 — Outro

- **Content:** `sydneykamau2005@gmail.com`, `github.com/surturn`, Invonics
  Technologies. **No phone number.** Sign-off echoing Scene 0's title card.
- **Motion:** iris/circle wipe, bookending Scene 0.
- **DOM only.** No contact form.

### Chrome

Nav dots (six, labelled, keyboard-focusable, driven by `activeSceneIndex`) and a
scroll progress bar in amber.

---

## 5. Content model

`src/content/content.ts` is the single source of truth for all copy and asset
paths. Real assets later are an edit here, never a component change.

```ts
type Media = { src: string | null; alt: string };   // null → labelled placeholder

export const content = {
  identity:   { name, role, location, coords, email, github, company },
  scene1:     { panels: Panel[]; stack: { group: string; items: string[] }[] },
  projects:   Project[];   // name, status, blurb, bullets[], stack[], poster: Media
  hobbies:    { items: HobbyItem[]; poster: Media },
  credentials: Credential[]; // title, issuer, period, note, image: Media
  outro:      { links: Link[]; signoff: string },
};
```

A `null` `src` renders a labelled placeholder block (dusk gradient + title text)
rather than breaking. The `poster` fields on `projects` and `hobbies` double as
the no-WebGL fallback images.

---

## 6. File structure

```
src/
  scenes/
    Scene0_TitleCard.tsx
    Scene1_Personal.tsx
    Scene2_Work.tsx
    Scene2_WorkCanvas.tsx      // lazy R3F, scene-scoped
    Scene3_Hobbies.tsx
    Scene3_HobbyObject.tsx     // lazy R3F, scene-scoped
    Scene4_Credentials.tsx
    Scene5_Outro.tsx
  components/
    NavDots.tsx  ProgressBar.tsx  ProjectCard.tsx  CredentialCard.tsx
    SceneFrame.tsx             // letterbox + grain + dusk wrapper
    Magnetic.tsx               // retained
    CanvasFallback.tsx
  motion/variants.ts
  three/CameraRig.tsx  lighting.ts  useWebGLSupport.ts
  content/content.ts
  lib/scrollStore.ts  useSceneProgress.ts  usePointerCoarse.ts  utils.ts
  App.tsx
```

**Deleted:** `src/pages/*`, `Layout.tsx`, `Navigation.tsx`, `ThemeProvider.tsx`,
`ThemeToggle.tsx`, `PageHeader.tsx`, and the unused `src/components/ui/*` files.
`Footer.tsx`, `BlurText.tsx`, `RevealHeading.tsx`, and `SectionLabel.tsx` are
deleted; the masked-line and stagger behaviour they implemented is reimplemented
once in `motion/variants.ts` and consumed by the scenes that need it.

---

## 7. Dependencies

**Add:** `lenis`, `zustand`, `three`, `@react-three/fiber`, `@types/three`.

**Remove** (stranded by retiring the pages, router, and contact form):
`react-router-dom`, `recharts`, `@tanstack/react-query`, `react-hook-form`,
`@hookform/resolvers`, `embla-carousel-react`, `react-day-picker`, `date-fns`,
`cmdk`, `vaul`, `input-otp`, `react-resizable-panels`, `next-themes`, `sonner`,
and the unused `@radix-ui/*` packages with their `ui/*` files.

`zod` is removed only if `src/__tests__/security/input-sanitization.test.ts`
still passes without it. Every removal is verified against the suite, and the
actual list is reported after Stage 1 rather than promised here.

**Not added:** `@react-three/drei`. Revisit per helper if one earns it.

---

## 8. Routing and deploy

`vercel.json` currently rewrites all paths to `/`, which serves the app but
**preserves the URL**. Replace with explicit redirects plus a catch-all:

```json
{
  "redirects": [
    { "source": "/about",         "destination": "/", "permanent": true },
    { "source": "/skills",        "destination": "/", "permanent": true },
    { "source": "/projects",      "destination": "/", "permanent": true },
    { "source": "/ai-automation", "destination": "/", "permanent": true },
    { "source": "/contact",       "destination": "/", "permanent": true }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

`NotFound.tsx` is deleted; a single-page site has no 404 state.

---

## 9. Testing

The existing security tests are static source scanners, not runtime component
tests, so retiring the pages does not break them structurally — with one
exception, verified by reading them rather than assumed:

- `security/xss.test.ts:169` ("should use proper form validation") ends in
  `expect(true).toBe(true)`. Informational. Unaffected.
- `security/input-sanitization.test.ts:55` ("should use schema validation for
  forms") asserts `expect(hasZodValidation || hasReactHookForm).toBe(true)` —
  a project-wide requirement that *some* `.tsx` file mentions zod or
  react-hook-form. **This fails** once the contact form and those dependencies
  are removed.

The fix is to correct the assertion's logic, not to keep a dependency alive to
satisfy it. The test's intent is "forms must be validated", not "this project
must contain a form", so it becomes conditional on a form existing. Rewritten in
Stage 1, Task 9.

### Bundle-size test rewrite

`src/__tests__/speed/bundle-size.test.ts` currently sums every `.js` in
`dist/assets` and gates at 800KB. That punishes correct code-splitting: a
properly lazy three.js chunk counts fully against a budget meant for the initial
payload. Rewrite:

- Enable `build.manifest: true` in `vite.config.ts`.
- Assert on the **entry chunk plus its static imports** — budget 350KB raw.
- Keep the CSS budget at 150KB.
- **New guard:** assert the 3D scenes resolve to separate chunks. This catches
  the real regression — someone makes a canvas a static import and drops ~700KB
  into the critical path.
- Total size becomes a reported number, not a hard gate.

### New tests

- **Canvas accessibility invariant:** with the canvas mocked out, every project
  name and credential title still resolves in the accessibility tree.
- **Degradation:** each scene renders its content under `prefers-reduced-motion`,
  with `webglSupported: false`, and at coarse pointer.

---

## 10. Performance budgets

| Metric | Budget |
|---|---|
| Entry chunk + static imports | 350KB raw |
| CSS | 150KB raw |
| Largest lazy 3D chunk | 900KB raw |
| Canvases in DOM at once | 1 |
| React re-renders per scroll frame | 0 |

---

## 11. Staging

Approval gate between every stage.

**Stage 1 — Foundation + Scenes 0–1.** Dependencies, Dusk tokens and fonts,
`content.ts`, scroll store, App shell, nav dots, progress bar, cold open,
personal pan. This is the build plan's milestone 1: it proves the riskiest motion
pattern before any 3D spend.

**Stage 2 — Scenes 4–5.** Credentials and outro, both pure DOM. **At the end of
this stage the whole page exists end to end with zero WebGL** — a complete,
shippable portfolio. The 3D then becomes additive rather than blocking.

**Stage 3 — Scene 2 + WebGL infrastructure.** Capability probe, lazy canvas
lifecycle, camera rig, poster fallbacks, node graph, detail stack.

**Stage 4 — Scene 3 + hardening.** Hobby scene, accessibility pass against the
canvas invariant, bundle-test rewrite, performance pass.

---

## 12. Risks

| Risk | Mitigation | Status |
|---|---|---|
| Scroll-jacking breaks keyboard/AT | Scroll-linked, not event-intercepting; native scroll preserved | Resolved by design |
| R3F on mobile GPUs | Lazy mount, `frameloop="never"` off-screen, one canvas at a time, poster fallback | Resolved by design |
| 3D content invisible to screen readers | Canvas invariant §3, asserted by test | Resolved by design |
| three.js blows the bundle gate | Test rewrite §9 + dependency prune §7 | Resolved by design |
| Didone hairlines on grained dark ground | Poster weight (700/opsz 24) | Resolved by art direction |
| Coarse-pointer detection imprecise at edges | `(pointer: coarse)` over width proxy; stack chosen for the ambiguous case | Accepted approximation |
| Project list may still be incomplete | `content.ts` is the single edit point; adding a node is a data change | Accepted |
