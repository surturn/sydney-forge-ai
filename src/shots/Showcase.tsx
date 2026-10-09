import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'showcase', chapter: 'work', length: 1.5, hold: [0.35, 0.85] };
const conceptProjects = content.projects.filter((p) => p.status === 'Concept' && p.liveUrl && p.figure);

/** Concept sites open the Work chapter: these prove the visual and UX side, the stories after them prove the engineering. */
function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <p className="kicker border-b-2 border-ink pb-2">III · Work · Showcase</p>
        <h2 id="shot-showcase-title" tabIndex={-1} className="display mt-5 max-w-4xl text-[clamp(2.25rem,6vw,var(--step-5))]">
          Two concept sites, built for range.
        </h2>
        <p data-intro className="standfirst mt-4 max-w-3xl text-[length:var(--step-1)]">
          The visual and UX side first: invented brands, each with its own type, palette and one signature moment. The stories that follow show how I engineer.
        </p>
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {conceptProjects.map((p) => (
            <li key={p.id} data-card className="flex flex-col border-2 border-ink bg-paper-raised">
              <a href={p.liveUrl} target="_blank" rel="noopener" className="group block" aria-label={`${p.name}, concept site (opens in a new tab)`}>
                <img
                  src={p.figure!.src}
                  alt={p.figure!.alt}
                  width={p.figure!.width}
                  height={p.figure!.height}
                  loading="lazy"
                  className="block aspect-[1200/630] w-full border-b-2 border-ink object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                />
              </a>
              <div className="flex flex-1 flex-col gap-2 px-4 py-4">
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="display text-[length:var(--step-2)]">{p.name}</span>
                  <span className="meta border border-ink px-2 py-0.5 text-ink">Concept</span>
                </p>
                <p className="leading-relaxed">{p.standfirst}</p>
                <p className="mt-auto pt-2">
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-[28px] items-center font-medium text-cobalt underline underline-offset-4 hover:underline-offset-8"
                  >
                    See it live ↗
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Shot>
  );
}

export const ShowcaseShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    // All in before the hold at 0.525s (0.35 × 1.5).
    tl.from(root.querySelector('h2'), { yPercent: 50, autoAlpha: 0, duration: 0.2 }, 0.05)
      .from(root.querySelector('[data-intro]'), { autoAlpha: 0, y: 14, duration: 0.15 }, 0.15)
      .from(root.querySelectorAll('[data-card]'), { clipPath: 'inset(0 0 100% 0)', stagger: 0.08, duration: 0.2 }, 0.22);
  },
};
