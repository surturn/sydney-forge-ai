# Sydney Kamau — Portfolio

Personal site of Sydney Kamau, a full-stack engineer in Nairobi working on AI systems.

Live: https://sydney-forge-ai.vercel.app

The site plays as a short film. A timed intro runs once, then scrolling moves through the story: who I am, what I build, the problems I solve, and how to get in touch. Visitors who prefer reduced motion, or who choose "Read as article", get the same content as a normal page.

## Stack

- React 18, TypeScript, Vite
- Tailwind CSS
- GSAP with ScrollTrigger, and Lenis for smooth native scrolling
- zustand for the small amount of shared state
- Vitest and Testing Library

## Running it

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:8080.

```bash
npm run build     # production build in dist/
npm run preview   # serve the build locally
npm test          # run the test suite
```

## Editing content

All copy lives in `src/content/` and can be changed without touching any animation code.

- `profile.json` — name, positioning, the profile panels, and the stack
- `projects/*.md` — one file per project
- `credentials.json`, `offhours.json`, `contact.json`, `site.json`

Content is checked when the site builds. A missing field or a reference to a project that does not exist stops the build with the file and field named.

## Project layout

```
src/
  content/   site copy and the schema that validates it
  film/      scroll engine, stage, intro, and navigation between shots
  shots/     one component per part of the story
  chrome/    the top bar, mode toggle, and skip link
vite/        build-time content loader
```

## Contact

- Email: sydneykamau2005@gmail.com
- GitHub: https://github.com/surturn
- LinkedIn: https://www.linkedin.com/in/sydney-kamau-991b362a2/
- Invonics Technologies: https://invonicstechnologies.com
