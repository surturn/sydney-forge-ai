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
- 2026-10-09: branch `feat/explainer-film` had `main` merged in (22a54c5), 187 tests pass. Not pushed.
- Reel keeps this branch's slowed timeline and chips. Portrait and caption come from `main`.
- A `git stash` holds older uncommitted test edits, superseded by `main`'s tests. Drop with `git stash drop` once checked.
- Untracked: `public/Profile Photo*.png`, `reports/stage-a.json`.
- `npm test` no longer runs the network `npm audit` test; use `npm run test:deps`. Default run: 24 files, 183 tests pass.
- Next: open a PR from `feat/explainer-film` to `main`.

## Verify (see global rule: drive it like a user, mobile 390x844 and desktop 1440x900, screenshots, fix until it works)
- `npm run dev`. Play the intro, scroll every chapter, use the chapter bar, open the Showcase cards and project stories, toggle article mode. Check reduced-motion too.
- Tests: `npm test`; dependency audit separately with `npm run test:deps`.
- After deploy, repeat on https://sydneykamau.vercel.app with a cache-busting query.
