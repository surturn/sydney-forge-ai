import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'for', chapter: 'contact', length: 1.5, hold: [0.35, 0.8] };
const f = content.profile.for;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <p className="kicker">IV · Contact · Who I build with</p>
        <h2 id="shot-for-title" tabIndex={-1} className="display mt-3 text-[clamp(2.5rem,7vw,var(--step-6))]">
          {f.heading}
        </h2>
        <ul className="mt-8 border-t-2 border-ink">
          {f.people.map((p, i) => (
            <li key={p.text} data-sector className="group flex items-baseline gap-4 border-b border-ink/20 py-2">
              <span className="meta transition-colors group-hover:text-cobalt">{String(i + 1).padStart(2, '0')}</span>
              {p.quote ? (
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="meta text-ink">{p.text}</span>
                  <q className="standfirst bg-lime px-2 text-[clamp(1.4rem,3.6vw,var(--step-3))] text-ink">{p.quote}</q>
                </span>
              ) : (
                <span className="display text-[clamp(1.4rem,3.6vw,var(--step-3))]">{p.text}</span>
              )}
            </li>
          ))}
        </ul>
        <p data-tail className="standfirst mt-6 text-[length:var(--step-1)]">
          {f.tail}
        </p>
      </div>
    </Shot>
  );
}

export const ForShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    tl.from(root.querySelectorAll('[data-sector]'), { clipPath: 'inset(0 100% 0 0)', stagger: 0.05, duration: 0.15 }, 0.05).from(
      root.querySelector('[data-tail]'),
      { autoAlpha: 0, y: 16, duration: 0.15 },
      0.35,
    );
  },
};
