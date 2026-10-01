import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'context', chapter: 'profile', length: 1.5, hold: [0.35, 0.85] };
const { context } = content.profile;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-safe-center gap-10 px-4 pt-20 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:px-8">
        <div>
          <p className="kicker">II · About · Context</p>
          <h2 id="shot-context-title" tabIndex={-1} className="display mt-3 text-[clamp(2.75rem,8vw,var(--step-6))]">
            {context.heading}
          </h2>
          <p data-aside className="mt-8 inline-block max-w-xs rotate-[1.5deg] bg-lime px-3 py-2 font-mono text-xs uppercase leading-relaxed tracking-[0.08em] text-ink">
            {context.aside}
          </p>
        </div>
        <div className="border-t-2 border-ink pt-6 md:border-l-2 md:border-t-0 md:pl-8 md:pt-0">
          {context.body.map((para, i) => (
            <p key={i} data-para className={`max-w-xl leading-relaxed ${i ? 'mt-4' : 'text-[length:var(--step-1)] leading-snug'}`}>
              {para}
            </p>
          ))}
          <p data-coda className="standfirst mt-6 text-[length:var(--step-3)] text-cobalt">
            {context.coda}
          </p>
        </div>
      </div>
    </Shot>
  );
}

export const ContextShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    // Everything lands before the hold at 0.525s (0.35 × 1.5).
    tl.from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.25 }, 0.05)
      .from(root.querySelectorAll('[data-para]'), { autoAlpha: 0, y: 14, stagger: 0.05, duration: 0.2 }, 0.1)
      .from(root.querySelector('[data-coda]'), { autoAlpha: 0, x: -20, duration: 0.15 }, 0.33)
      .from(root.querySelector('[data-aside]'), { scale: 1.6, rotate: -8, autoAlpha: 0, duration: 0.15, ease: 'back.out(2)' }, 0.35);
  },
};
