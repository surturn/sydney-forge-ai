# Explainer Film Portfolio — Design

**Date:** 2026-10-01
**Repo:** `sydney-forge-ai`
**Branch:** `feat/explainer-film`
**Status:** Draft for review
**Supersedes:** `2026-08-19-cinematic-scroll-portfolio-design.md` for art direction,
scene structure, motion engine, content model, WebGL, and staging. Sections of
that spec not contradicted here (toolchain, Lenis on native scroll, the
continuous/discrete state split, the vercel redirects, the test-suite rulings)
still hold.

The portfolio becomes a scroll-scrubbed motion film: a timed motion reel as the
hook, then one pinned stage on which native scroll scrubs a single master
timeline of shots. It reads like an animated editorial explainer, not a stack
of sections with entrance animations.

---

## 1. Positioning and audience

**Who:** Sydney Kamau. Full-stack engineer with intermediate-to-advanced depth
in AI systems: training local models, integrating LLMs, and building the
fine-tuning and RAG pipelines around them. The creative, solution-driven
technical resource a project brings in. Founder of Invonics Technologies on the
side: Invonics audits business workflows and systems, then refines them or
builds new ones, and supplies web design, mobile, and full-stack engineering as
outsourced capacity.

**Audiences, equally weighted:**

1. Project clients — founders, agencies, teams who need a technical resource
   brought in.
2. Employers — hiring managers and recruiters for full-stack / AI roles.

The film serves both and ends on three doors (§7).

**Copy rules:** no "senior". "AI systems" is the claim, proven by Digital Twin
and FarmAssist. Nothing is invented; every claim links to a project that
demonstrates it. Features a project README marks as designed or long-term are
labelled "In progress" on the page.

---

## 2. Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Format | Timed cold-open reel, then a scroll-scrubbed film | The reel is the hook; scroll scrubbing gives the visitor the pace for everything after it |
| Motion engine | GSAP + ScrollTrigger replace Framer Motion | One master timeline with pinning and scrubbing is GSAP's core case; GSAP and all its plugins are free |
| Smooth scroll | Lenis, driving native document scroll | Unchanged from the August spec; keyboard, find-in-page, and AT keep working |
| WebGL | Dropped. `three` / R3F are never installed | The explainer diagrams are the signature now; CSS 3D transforms carry the paper-cutout depth; removes ~600KB and the riskiest mobile item |
| Art direction | Editorial "Issue 01" × Matatu pop palette | Chosen from three mocked palettes plus an editorial mock |
| Content | Markdown/JSON files, validated at build | Projects and achievements change without touching animation code |
| Analytics | Umami Cloud, cookieless | Custom events on the free tier; no consent banner |
| Contact | WhatsApp, phone, email, CV, optional booking link | The owner asked for a direct call/write CTA, including the phone number |
| Fallback | A complete editorial article built from the same DOM | Reduced motion, Save-Data, no-JS, and screen readers all get a real document |

---

## 3. Art direction — "Issue 01"

The page is one issue of a Nairobi features magazine with the owner as the
cover story. Editorial structure (masthead, standfirst, sections, captions,
folios) carries clarity; Matatu pop carries attention and local identity.

### Palette

Single light theme. No theme toggle.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FFF3E2` | Ground |
| `--paper-raised` | `#FFFFFF` | Cards, figures |
| `--ink` | `#14121F` | Primary text, rules |
| `--ink-muted` | `#5A5470` | Secondary text, captions |
| `--cobalt` | `#2340FF` | Trust: meta, links, focus ring |
| `--signal` | `#FF4F1F` | Action: primary CTA fill, failure step in flows |
| `--lime` | `#C8F031` | Novelty: sticker chips, recovery step in flows |

Declared as HSL triplets so `hsl(var(--x))` Tailwind usage keeps working.

**Contrast rules** (asserted by test, §10):

| Pair | Ratio | Allowed use |
|---|---|---|
| ink on paper | 16.9 | Any text |
| ink-muted on paper | 6.5 | Any text |
| ink-muted on paper-raised | 7.2 | Any text |
| cobalt on paper | 5.9 | Any text |
| ink on signal | 5.6 | CTA labels |
| ink on lime | 14.1 | Chip labels |
| signal on paper | 3.0 | Large text (≥ 24px) and non-text only |
| lime on paper | 1.2 | Never as text or as a meaningful boundary on paper |

Signal and lime are fills behind ink, never text on paper.

### Type

| Role | Family | Setting |
|---|---|---|
| Headlines, cover line | Bodoni Moda | roman, `wght 700`, `opsz` high |
| Standfirsts, pull quotes | Bodoni Moda | italic, `wght 500` |
| Body | Inter Tight | 400 / 500 / 600 |
| Meta, folios, chips, flow labels | IBM Plex Mono | 400 / 500, uppercase, `letter-spacing: .12em` |

The Google Fonts URL adds the Bodoni italic axis. Fallback faces get
`size-adjust` / `ascent-override` metrics so the swap does not shift layout.
The existing `--step-*` scale stays.

### Devices

2px ink rules; hairline column dividers; folio numbers; figure captions
("Fig. 1 — …"); a matatu livery stripe (signal / cobalt / lime bands) as the
transition device; paper texture (the existing SVG grain, lower opacity,
multiply); crop marks around figures; square corners throughout.

### Retired

The Dusk palette, the dusk gradient, the dark ground, and the letterbox bars.

---

## 4. Architecture

### Overview

```
                    ┌────────────────────────────────────────┐
  load ───────────► │ Reel (time-based GSAP timeline, ~8.5s) │──► ends on the Cover rest frame
                    └────────────────────────────────────────┘
                                       │ handoff
                                       ▼
  Lenis (native scroll) ──► ScrollTrigger ──► master timeline (scrubbed)
                                                 ├─ shot 1 timeline
                                                 ├─ shot 2 timeline
                                                 └─ …
                    scrollState (mutable, per-frame)   useFilmStore (zustand, discrete)
```

### Film engine — `src/film/`

| Unit | Responsibility |
|---|---|
| `Stage.tsx` | The pinned viewport. Renders every shot absolutely positioned; owns the scroll spacer whose height is the sum of shot lengths |
| `Shot.tsx` | Wrapper per shot: id, length (in viewport-heights), hold window, chapter. Sets `inert` and `aria-hidden` when inactive |
| `registry.ts` | Shots register `{ id, length, hold: [start, end], build(tl, el) }`. The registry computes each shot's start/end in master-timeline progress |
| `useFilm.ts` | Builds the master timeline once, attaches ScrollTrigger (`scrub: true`, pinned), wires Lenis → `ScrollTrigger.update`, tears down on unmount |
| `Reel.tsx` | The timed cold open (§6). Pausable, skippable, plays once per session |
| `seek.ts` | `seekToShot(id)` scrolls to the shot's hold start through Lenis. Used by the chapter bar, proof chips, and skip link |
| `useFilmStore` | zustand, discrete only: `activeShot`, `mode: 'film' \| 'article'`, `reelState`, `reducedMotion`, `saveData` |

`scrollState` and the existing rule stay: **nothing subscribes to scroll
progress through React state.** Shots animate through their GSAP timelines;
React re-renders only on `activeShot` and `mode` changes (≈ 15 per full
scroll).

### Shot contract

```ts
type ShotDef = {
  id: string;                 // also the anchor id: #shot-<id>
  chapter: 'cover' | 'profile' | 'work' | 'contact';
  length: number;             // viewport-heights of scroll
  hold: [number, number];     // 0..1 within the shot; nothing moves inside it
  build: (tl: gsap.core.Timeline, root: HTMLElement) => void;
};
```

Every shot owns a **hold window**: about 40% of its length during which no
element moves, so text is read still. Transitions happen only outside holds.
Seeks always land at `hold[0]`.

Shot timelines use transforms, opacity, and `clip-path` only. No animated
`width`, `height`, `top`, `left`, `filter: blur`, or box-shadow.

### Explainer flow template — `src/film/flow/`

One component, `FlowShot`, renders any project's `flow` data (§8) as an
animated sequence diagram in SVG: actors become labelled columns; each step
becomes a message travelling between them in order; `fail` steps snap and flash
signal; `recover` steps land lime. Step labels are real text in a visually
hidden `<ol>` mirror. A new project with a `flow` block needs no animation
code.

### Article mode

The same shot DOM, re-laid as a normal editorial document: ScrollTrigger and
Lenis are not created, the stage is unpinned, shots stack in order at their
rest frames, the reel does not play.

Entered when **any** of:

- `prefers-reduced-motion: reduce`;
- `navigator.connection.saveData === true`;
- the visitor toggles **Read as article** (always visible in the chrome;
  choice persisted in `localStorage`, wrapped in try/catch);
- JavaScript fails: the pre-rendered fallback is the article (see §9).

### Touch and small screens

Same film, not a collapse to a stack. Each shot defines a portrait layout via
container queries; flows switch to vertical (actors as rows). Shot lengths are
in `svh` so the mobile URL bar cannot jitter the pin.

---

## 5. Storyboard

Total ≈ 30 viewport-heights; ≈ 90s at a relaxed scroll.

| # | Shot | Chapter | Len | Motion / explainer | Rest frame | KPI |
|---|---|---|---|---|---|---|
| 0 | **Cover** | cover | 1.5 | Reel ends here (§6). On scroll: masthead shrinks into the chapter bar, portrait pushes in | Masthead, cover line, standfirst, proof chips, all CTAs | 10s identity, 30s clarity |
| 1 | **Who** | profile | 2 | Camera through the portrait; "Engineer. Founder." sets; Invonics stamp lands with its one-line description | Who paragraph + Invonics line | Clarity |
| 2 | **What** | profile | 3 | Name letters scatter and re-form as a **layered system diagram** — Android / Web / Backend / Data / AI — each layer setting its stack in mono | Full stack diagram, legible | Full-stack depth at a glance |
| 3 | **Solves** | profile | 3 | Real conditions hit the diagram one by one: a swarm of buyers, signal bars dropping, a payment arrow snapping, a workflow clogging. Each is labelled, resolved, and tagged with its proof chip | List of six conditions with chips | Depth, engagement |
| 4 | **For** | profile | 1.5 | Resolved conditions re-sort into a newspaper index of who they serve | Sector index | Client relevance |
| 5 | **Case files** | work | 1.5 | Title card; five project folios fan out like a magazine spread | Five folios, numbered | Signature #1 |
| 6–10 | **Explainers** ×5 | work | 3 each | Per project: title + status → problem pull quote → **animated flow** → stack sidebar slides in → figure under crop marks → outcome line | Flow complete, all text set | Signature #2; depth |
| 11 | **Index roll** | work | 1.5 | Remaining projects roll as end credits | Index list | Breadth |
| 12 | **Off-hours** | contact | 1.5 | A print-graphic football rolls across under a short column | Column | Personality |
| 13 | **Credentials** | contact | 2 | Rolling-credits listings with leader dots | Five listings | Proof |
| 14 | **Back cover** | contact | 2 | The film settles; stripe wipes; doors stamp in | Fully interactive contact page + colophon | Signature #3; conversion |

### Shot copy

**Cover.** Kicker `FULL-STACK ENGINEER · AI SYSTEMS`. Cover line `SYDNEY
KAMAU`. Standfirst: *The technical person you bring in when a project needs a
solution nobody has drawn yet.* Chips: `AssetFlow ↓` `Eventify ↓` `Digital Twin
↓`. CTAs: **Work with me** (seeks to Back cover), **Hiring? CV**. Masthead:
`ISSUE 01 · NAIROBI` · `-1.2921°, 36.8219°` · issue date.

**Who.** Full-stack engineer with depth in AI and AI infrastructure. Nairobi.
The technical person you bring in when a project needs a solution nobody has
drawn yet. Founder of Invonics Technologies — we audit how a business actually
works, then refine its systems or build new ones.

**What.** I design and build whole systems — backend, frontend, mobile, and
the AI inside them. Backends that move money and survive load · web apps in
React and Angular · Android in Kotlin · AI systems end to end: training my own
models locally, integrating LLMs, and building the fine-tuning and RAG
pipelines around them.

Stack diagram layers:

| Layer | Items |
|---|---|
| AI | PyTorch · YOLOv8 · LangChain · ChromaDB · OpenAI · Groq · NumPy |
| Android | Kotlin |
| Web | React · TypeScript · Angular · Tailwind CSS · Vite |
| Backend | Django · FastAPI · Fastify · Express · Spring Boot · Celery · BullMQ |
| Data / infra | PostgreSQL · Redis · Docker · Railway · Vercel · Sentry · Cloudflare R2 |

**Solves.** Software that has to hold up in real conditions.

| Condition | Proof |
|---|---|
| Thousands of buyers, one ticket tier, no overselling | Eventify |
| Payments that confirm even when the M-Pesa callback never arrives | Eventify |
| Classrooms with patchy signal that still work offline | AssetFlow |
| Many schools on one system, each one's data walled off | AssetFlow |
| AI that does real work but leaves the final call to a person | Invonics automations, Invonics CRM |
| Answers grounded in your own material, with faithfulness measured | Digital Twin |

**For.** Schools and institutions · event organisers · retailers · farmers ·
students and educators · sales teams and growing businesses — and any team
that needs technical depth without a full-time hire.

---

## 6. The reel (cold open)

Time-based, ≈ 8.5s, one GSAP timeline. No sound, ever.

| t (s) | Beat |
|---|---|
| 0.0–0.8 | Ink frame. Livery stripes slash across like a passing matatu (skew + translate) |
| 0.8–2.0 | Kinetic cut montage, ~0.25s per card on alternating grounds: `PAYMENTS.` `OFFLINE.` `AI.` `LOAD.` `NAIROBI.` |
| 2.0–3.5 | A flow line draws: a payment arrow snaps (signal), reconnects (lime). Teaser of the explainers |
| 3.5–5.0 | `ISSUE 01` masthead slams in; paper floods outward from centre |
| 5.0–7.0 | `SYDNEY KAMAU` sets letter by letter; portrait rises under crop marks |
| 7.0–8.5 | Standfirst sets; chips pop on as stickers; CTAs land. Rest frame = Cover |

### Rules

- **Controls:** a visible Pause/Play and **Skip** (WCAG 2.2.2). Both keyboard
  reachable; Skip is the first focusable element.
- **Any input skips:** wheel, touch-move, or key press during the reel seeks it
  to its end and hands control to scroll. The reel never blocks scrolling.
- **Once per session:** `sessionStorage` flag; a reload in the same session
  starts at the Cover rest frame. A **Replay** control sits in the chrome.
- **Reduced motion / article mode:** reel never plays; the Cover rest frame
  renders immediately.
- **No flashing hazard:** montage cuts change ground colour at most 4 times per
  second, and never alternate high-luminance frames faster than 3 per second
  across more than a quarter of the viewport (WCAG 2.3.1).
- **LCP:** a timed reveal can push LCP past budget, because the largest element
  appears late. Mitigation: the montage card text at 0.8s is set larger than
  the cover line, so the earliest large paint is the largest; the cover line
  and portrait are smaller than it. Verified with Lighthouse at the end of
  Stage A. If LCP still exceeds 2.5s, the fallback is to render the cover line
  at frame 0 and play the reel around it.

---

## 7. Contact — the back cover

Three doors, then links, then the colophon.

1. **Book a call or write.** WhatsApp (`https://wa.me/<phone>?text=<prefilled>`),
   phone (`tel:<phone>`), email. When `contact.bookingUrl` is set, a **Pick a
   time** button appears and opens it in a new tab; until then, booking is a
   prefilled WhatsApp message ("Hi Sydney, I'd like to book a call about…").
2. **Bring me onto your project.** `mailto:` with a prefilled subject and a
   three-line prompt in the body: what you're building, timeline, budget range.
3. **Hiring? Here's my CV.** Opens a PDF in a new tab. The PDF is generated
   from `public/Sydney_Kamau_Resume.docx` and committed as
   `public/Sydney_Kamau_CV.pdf`. The stale `SydneyKamauResume.docx` is deleted.

Links: email `sydneykamau2005@gmail.com` · GitHub `github.com/surturn` ·
LinkedIn `linkedin.com/in/sydney-kamau-991b362a2` · Invonics
`invonicstechnologies.com`.

**Work with me** appears in the chrome on every shot and seeks to this shot.

### Phone number handling

The number is published on the page at the owner's explicit request. It does
not live in the public repository: it is read from the build-time environment
variable `VITE_CONTACT_PHONE` (set in Vercel), so source-scraping bots that
mine GitHub never see it. The rendered link is assembled at runtime; it is not
in the static HTML. Both measures stop casual scrapers only. If the variable
is unset, the phone and WhatsApp options are hidden and email remains.

---

## 8. Content model

`src/content/` holds every word and asset reference. `content.ts` is retired.

```
profile.json       identity, portrait, cover, panels (who / what / solves / for), stack layers
projects/*.md      one file per project
credentials.json   listings
offhours.json      column copy + figure
contact.json       doors, links, bookingUrl, colophon
site.json          issue number, issue date, chapter labels, nav labels
```

### Project file

```markdown
---
id: eventify
name: Eventify
status: Live            # Live | Beta | In progress
tier: featured          # featured | index
order: 2
repo: { url: https://github.com/surturn/ticketing-app, private: false }
liveUrl: https://ticketing-app-vert.vercel.app
standfirst: Event ticketing and M-Pesa payments for the Kenyan market.
problem: "The M-Pesa callback never arrived. The ticket still printed."
stack: [Fastify, PostgreSQL, Drizzle, Redis, BullMQ, M-Pesa Daraja]
figure: { src: /images/placeholders/eventify.webp, alt: "...", credit: "...", placeholder: true }
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

Short case-study body: paragraphs, bullets, emphasis, links, inline code.
```

`flow` is required for `tier: featured` and absent for `tier: index`.
`repo.private: true` renders "Private repository" instead of a link.

### Roster

| Order | Project | Tier | Repo | Status |
|---|---|---|---|---|
| 1 | AssetFlow Schools | featured | private | Beta |
| 2 | Eventify | featured | public `ticketing-app` | Live |
| 3 | Digital Twin | featured | private | In progress |
| 4 | FarmAssist | featured | public `farm-assist-grow` | In progress |
| 5 | FoRUs | featured | private | In progress |
| — | LuckLotter | index | public `luckylotter` | In progress |
| — | Invonics CRM | index | private | Live (internal) |
| — | Invonics automations | index | private | Live (internal) |

Statuses are drawn from each README and the profile's "now running" card; the
owner corrects any of them in the files. Each featured project's flow is
written from its README in Stage B and reviewed by the owner before merge.

Excluded: TableWise, Littlefoot Learning, Bizard Leads / `sales_dashboard`
(and the CV's lead-generation project and its 60% figure), CampusMarket, the
course storefront, `aiStudies` as a listed project. No Eclectics attachment.

### Credentials

BSc Computer Science, Multimedia University of Kenya, 2024–present ·
Certificate in Full Stack Development, Emobilis, 2024 · President's Award
Kenya, Gold Level, Chairman (Western Region) · Quantium simulation (pricing
analysis application) · Datacom simulation (AI tools for debugging and system
design).

### Build-time pipeline — `vite/content.ts`

A Vite plugin reads `src/content/`, parses front matter and JSON, validates
everything with zod, converts Markdown bodies to a restricted node tree
(paragraph, list, strong, em, link, inline code — anything else fails), and
exposes the result as `virtual:content`.

The build **fails**, naming file and field, when:

- a required field is missing or mistyped;
- a cover chip or Solves proof references a project id that does not exist;
- a featured project has no `flow`, or a flow step names an actor not in
  `actors`;
- a Markdown body contains an unsupported node.

No Markdown library ships to the browser. Nothing renders through
`dangerouslySetInnerHTML`.

---

## 9. Images

Every image is `{ src, alt, credit?, placeholder? }` in content.

| Slot | Now | Later |
|---|---|---|
| Cover portrait | Placeholder image, captioned "Fig. 1 — the engineer, Nairobi" | Owner's photo (`src/assets/sydney-portrait.jpg` is available) |
| Project figures (5) | Stock placeholder with a visible caption: "Placeholder — screenshot coming" | Real screenshots |
| Atmosphere (Who, Solves, Case files openers, Off-hours) | Stock | Stock or owner's photos |

- **Stock never poses as the owner's work.** `placeholder: true` renders the
  caption; the content test fails a featured project figure that is stock
  without it.
- Sources: Unsplash and Pexels only. Credits listed in the colophon.
- Shortlist first: thumbnail link, photographer, licence. **Nothing is
  downloaded until the owner approves the shortlist.**
- Self-hosted under `public/images/`, WebP at 800w and 1600w, explicit
  `width`/`height`. No hotlinking.
- Cover portrait: `loading="eager"`, `fetchpriority="high"`. All others lazy,
  with shots preloading the next shot's images when the previous shot enters.

### No-JS fallback

`index.html` contains a static, pre-rendered article of the cover, profile,
project names with standfirsts, and contact links, inside `<noscript>`-safe
markup that React replaces on mount. Generated at build time by the content
plugin from the same data.

---

## 10. Measurement — Umami Cloud

- Script `defer`, website id from `VITE_UMAMI_ID`; no id → no script.
- `track(event, data)` wrapper no-ops when Umami is absent or blocked.

| Event | Data |
|---|---|
| `reel` | `{ action: complete \| skip \| pause \| replay }` |
| `cta_click` | `{ door: call \| whatsapp \| phone \| email \| project \| cv \| book \| github \| linkedin \| invonics, location: chrome \| cover \| back-cover }` |
| `chip_click` | `{ project }` |
| `shot_reached` | `{ shot }` — once per shot per visit |
| `scroll_depth` | `{ pct: 25 \| 50 \| 70 \| 100 }` — once each |
| `mode` | `{ to: article \| film, reason: toggle \| reduced-motion \| save-data }` |
| `web_vital` | `{ name: LCP \| INP \| CLS, value, rating }` via `web-vitals` |

### KPI targets

| KPI | Target | Source |
|---|---|---|
| Scroll depth to Back cover | ≥ 70% of visits | `scroll_depth`, `shot_reached` |
| Avg. time on page | ≥ 90s | Umami visit duration |
| CTA click-through | ≥ 5% of visits | `cta_click` |
| Reel completion | tracked, no target yet | `reel` |
| LCP / INP / CLS (mobile, p75) | < 2.5s / < 200ms / < 0.1 | `web_vital` |

The 5% target is a starting default, revisited after a month of data.

---

## 11. Accessibility — WCAG 2.2 AA

- One `h1` (the name). `h2` per chapter, `h3` per shot.
- Document order equals film order; screen readers read the article.
- Inactive shots are `inert`; tab order follows the active shot. Space, Page
  Down, and arrow keys advance the film through native scroll.
- Skip link: "Skip to contact". Chapter bar: four labelled buttons, current
  chapter has `aria-current`.
- Focus ring: 2px cobalt, 2px offset.
- Targets ≥ 24×24px (2.5.8). The chrome never covers a focused element
  (2.4.11).
- Reel: pausable, skippable, no flashing hazard (§6).
- Flow diagrams: SVG `aria-hidden`; a visually hidden `<ol>` of steps mirrors
  each one.
- Article mode for reduced motion, toggle, Save-Data, no-JS.

---

## 12. Performance

| Budget | Value |
|---|---|
| Entry JS (entry + static imports) | 200KB raw |
| CSS | 150KB raw |
| LCP / INP / CLS | < 2.5s / < 200ms / < 0.1 on a mid-tier Android |
| Scroll | 60fps; zero React re-renders per scroll frame |
| Animated properties | transform, opacity, clip-path only |

- GSAP core + ScrollTrigger are the only animation dependencies; Framer Motion
  is removed.
- Shots far from the playhead get `content-visibility: hidden`; only the
  active shot and its neighbours paint.
- `will-change` is set only on elements in the active shot, and removed after.
- The bundle-size test is rewritten as the August spec §9 describes, with the
  entry budget lowered to 200KB and the 3D-chunk guard replaced by a guard that
  `three` is not a dependency.

---

## 13. Testing

Kept: security scanners, the dependency test, the media-query hooks, the
scroll-store maths.

New:

- **Content:** schema validity, chip/proof references, flow actor
  references, placeholder captions on stock figures.
- **Contrast:** parses palette tokens from `index.css` and asserts every pair
  in §3's table.
- **Film registry:** shot offsets sum to the spacer length; holds lie inside
  shots; `seekToShot` targets `hold[0]`.
- **Article mode:** under reduced motion, with Save-Data, and when toggled,
  every shot's heading, every project name, and every contact door are in the
  accessibility tree and nothing is `inert`.
- **Reel:** Skip and Pause are focusable first; input during the reel ends it;
  the session flag suppresses replay.
- **Flow mirror:** each featured project's `<ol>` mirror matches its steps.
- **Track:** no-op without Umami; event payload shapes.
- **Phone:** with `VITE_CONTACT_PHONE` unset, WhatsApp and phone options are
  absent and the number does not appear in `dist/index.html` when set.

Existing scene tests for `Scene0_TitleCard` and `Scene1_Personal` are deleted
with those components.

---

## 14. File structure

```
src/
  film/
    Stage.tsx  Shot.tsx  Reel.tsx  registry.ts  useFilm.ts  seek.ts  store.ts
    flow/FlowShot.tsx  flow/layout.ts
  shots/
    Cover.tsx  Who.tsx  What.tsx  Solves.tsx  For.tsx  CaseFiles.tsx
    Explainer.tsx   IndexRoll.tsx  OffHours.tsx  Credentials.tsx  BackCover.tsx
  chrome/
    ChapterBar.tsx  WorkWithMe.tsx  ModeToggle.tsx  ReelControls.tsx  SkipLink.tsx
  content/
    profile.json  credentials.json  offhours.json  contact.json  site.json
    projects/*.md  schema.ts
  lib/
    scrollStore.ts  useMediaQuery.ts  track.ts  vitals.ts  utils.ts
  App.tsx  main.tsx  index.css
vite/
  content.ts
public/
  images/placeholders/…  Sydney_Kamau_CV.pdf
```

Deleted: `scenes/*`, `SceneFrame.tsx`, `NavDots.tsx`, `ProgressBar.tsx`,
`motion/variants.ts`, `content/content.ts`, `public/SydneyKamauResume.docx`.
`Magnetic.tsx` is reused for the back-cover doors or deleted in Stage C.

## 15. Dependencies

**Add:** `gsap`, `web-vitals`, `yaml`, `marked` (build-time only, used inside
the Vite plugin), `zod` if absent.
**Remove:** `framer-motion`.
**Never add:** `three`, `@react-three/fiber`, `@react-three/drei`.

---

## 16. Staging

Approval gate between stages. Each stage ends deployable.

**Stage A — Engine and opening.** Matatu pop tokens, fonts, paper texture;
content files, plugin, schema; film engine (stage, shots, registry, holds,
seek, chapter bar, article mode, mode toggle); the reel; shots 0–4 (Cover, Who,
What, Solves, For); placeholder image shortlist → approval → download; Lighthouse
check of the reel's LCP.

**Stage B — Explainers.** `FlowShot`; Case files; five explainer shots with
flows drafted from each README and reviewed by the owner; Index roll.

**Stage C — Ending and conversion.** Off-hours, Credentials, Back cover with
all three doors; CV PDF; phone via environment variable; Umami, `track`,
`web-vitals`; the no-JS pre-rendered article.

**Stage D — Hardening.** Mid-tier Android pass (60fps, LCP/INP/CLS); WCAG 2.2
audit against §11; bundle-test rewrite; image-weight pass; copy review.

---

## 17. Risks

| Risk | Mitigation |
|---|---|
| Timed reel delays LCP | Largest paint is early montage type; fallback renders the cover line at frame 0 (§6) |
| Scrubbed film feels like scroll-jacking | Native scroll only; holds; chapter bar; Read as article; any-input skips the reel |
| Keyboard users trapped in a pinned stage | Inactive shots inert; native scroll keys advance; skip link; chapter bar |
| Flow diagrams unreadable on phones | Vertical flow layout under container queries; mirrored `<ol>` |
| Mid-tier Android jank | Transform/opacity/clip-path only; `content-visibility` on distant shots; no WebGL |
| Stock images mistaken for real work | `placeholder: true` caption enforced by test |
| Phone number scraped | Env var, runtime assembly; the owner accepted the residual risk |
| Flow copy misstates how a system works | Each flow drafted from its README and reviewed by the owner in Stage B |
| GSAP + Lenis + React StrictMode double-mount | `useFilm` builds inside `gsap.context()` and reverts on cleanup |
