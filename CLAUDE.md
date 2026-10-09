# sydney-forge-ai

Sydney Kamau's portfolio. Live: https://sydneykamau.vercel.app. Plays as a short film: timed intro, then scroll chapters (About, Showcase, project stories, contact).

## Stack
React 18, TypeScript, Vite, Tailwind, GSAP + ScrollTrigger, Lenis, zustand, zod. Content is data: `src/content/*.json` and `src/content/projects/*.md`, loaded and validated by `vite/loadContent.ts`. Pages are "shots" in `src/shots/`, ordered by a registry.

## Commands
- `npm run dev` / `npm run build`
- `npm test` (vitest). The network-dependent audit check is separate: `npm run test:deps`.
- `npx tsc --noEmit` before committing.

## Rules
- Concept sites (Halcyne, Fenn Atelier) use status `Concept`, never `Live`. Cards are generated from that status.
- Shot order is asserted in tests. Changing order or headings means updating `src/__tests__/App.test.tsx` and `shots/*.test.tsx`.
- Never render a phone number. Never use the word "senior" in content (both are tested).
- Credits for photographers live in the READMEs of the showcase sites.

## Deploy
Vercel, auto-deploy on push to `main`. Use `sydneykamau.vercel.app`, not per-deployment URLs (they sit behind Vercel Authentication).

## Graph
`graphify-out/` has a code graph (local, not committed). Ask `graphify query "..."` before reading many files.

## Session state (update at the end of each session)
- 2026-10-09: PR 2 (`feat/explainer-film`) merged to `main` and verified on production at desktop and mobile. Branch and old stash deleted.
- Reel keeps the slowed timeline and chips. Portrait and caption come from `main`.
- `npm test` no longer runs the network `npm audit` test; use `npm run test:deps`. Default run: 24 files, 183 tests pass.
- Untracked: `public/Profile Photo*.png`, `reports/stage-a.json`, `.claude/launch.json`.
- Fixed in `fix/link-preview-and-intro-words`: absolute `og:image`, `og:url` and canonical tags, a real 1200x630 PNG card (source: `scripts/og.html`, screenshot at 1200x630 into `public/og-image.png`), and the intro word montage (zero `y` in `reelTimeline.ts` so CSS parking does not add a pixel offset to `yPercent`).
- The intro fix was verified by seeking the GSAP timeline, not by watching: headless runs at about 2 fps and GSAP lag smoothing slows the timeline. Still worth one look on a real phone.

## Verify (see global rule: drive it like a user, mobile 390x844 and desktop 1440x900, screenshots, fix until it works)
- `npm run dev`. Play the intro, scroll every chapter, use the chapter bar, open the Showcase cards and project stories, toggle article mode. Check reduced-motion too.
- Tests: `npm test`; dependency audit separately with `npm run test:deps`.
- After deploy, repeat on https://sydneykamau.vercel.app with a cache-busting query.
