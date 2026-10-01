import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';
import { ProofChips } from './ProofChips';

const def: ShotDef = { id: 'solves', chapter: 'work', length: 3, hold: [0.72, 0.92] };
const { solves } = content.profile;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <p className="kicker">III · Work · Real conditions</p>
        <h2 id="shot-solves-title" tabIndex={-1} className="display mt-3 max-w-4xl text-[clamp(2.25rem,6vw,var(--step-5))]">
          {solves.heading}
        </h2>
        <p data-sub className="standfirst mt-4 max-w-2xl text-[length:var(--step-1)]">
          {solves.standfirst}
        </p>
        <ol className="mt-8 grid gap-x-8 md:grid-cols-2">
          {solves.items.map((item, i) => (
            <li key={item.label} data-condition className="relative overflow-hidden border-t-2 border-ink py-3">
              <span data-hit aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-signal" />
              <span data-fix aria-hidden="true" className="absolute inset-y-0 left-0 w-full origin-left bg-lime" />
              <div className="relative flex items-start gap-3">
                <span className="meta pt-1 text-ink">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-cobalt">{item.label}</p>
                  <p className="mt-1 font-medium leading-snug">{item.scenario}</p>
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
      .from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.3 }, 0.1)
      .from(root.querySelector('[data-sub]'), { autoAlpha: 0, y: 12, duration: 0.2 }, 0.25);
    // Each condition is hit (signal), then fixed (lime); all six finish before the hold at 2.16s.
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
