import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'figuring', chapter: 'work', length: 1.5, hold: [0.35, 0.85] };
const { figuring } = content.profile;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <p className="kicker">III · Work · Open questions</p>
        <h2 id="shot-figuring-title" tabIndex={-1} className="display mt-3 text-[clamp(2.5rem,7vw,var(--step-6))]">
          {figuring.heading}
        </h2>
        <p data-intro className="mt-4 max-w-xl text-ink-muted">
          {figuring.intro}
        </p>
        <ol className="mt-8 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2">
          {figuring.questions.map((q, i) => (
            <li
              key={q}
              data-question
              className={`px-4 py-5 transition-colors duration-300 ${
                i === figuring.questions.length - 1 ? 'bg-lime hover:bg-paper-raised' : 'bg-paper hover:bg-paper-raised'
              }`}
            >
              <p className="meta text-ink">Q.{String(i + 1).padStart(2, '0')}</p>
              <p className="standfirst mt-2 text-[length:var(--step-1)]">{q}</p>
            </li>
          ))}
        </ol>
      </div>
    </Shot>
  );
}

export const FiguringShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    // In before the hold at 0.525s (0.35 × 1.5).
    tl.from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.25 }, 0.05)
      .from(root.querySelector('[data-intro]'), { autoAlpha: 0, duration: 0.15 }, 0.15)
      .from(root.querySelectorAll('[data-question]'), { autoAlpha: 0, y: 24, stagger: 0.05, duration: 0.15 }, 0.2);
  },
};
