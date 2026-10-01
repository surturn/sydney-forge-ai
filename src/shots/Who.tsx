import gsap from 'gsap';
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'who', chapter: 'profile', length: 2, hold: [0.3, 0.75] };
const { profile } = content;

function Component() {
  const { who } = profile;
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-safe-center gap-10 px-4 pt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:px-8">
        <div>
          <p className="kicker">II · About · What I do</p>
          <h2 id="shot-who-title" tabIndex={-1} className="display mt-3 text-[clamp(2.75rem,8vw,var(--step-6))]">
            {/* Readable name for AT; the animated words are decorative copies. */}
            <span className="sr-only">{who.heading}</span>
            <span aria-hidden="true">
              {who.heading.split(' ').map((w, i) => (
                <span key={i} data-scatter className="inline-block pr-[0.2em]">
                  {w}
                </span>
              ))}
            </span>
          </h2>
          <p data-who-lead className="standfirst mt-6 max-w-md text-[length:var(--step-1)]">
            {who.lead}
          </p>
        </div>
        <div data-who-copy className="border-l-2 border-ink pl-6">
          <p className="text-[length:var(--step-1)] leading-snug">{who.intro}</p>
          <ul className="mt-4 border-t border-ink/20">
            {who.examples.map((ex) => (
              <li key={ex} className="flex gap-3 border-b border-ink/20 py-2 leading-snug">
                <span aria-hidden="true" className="font-mono text-cobalt">→</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-lg leading-relaxed">{who.close}</p>
          <div data-stamp className="mt-8 inline-block rotate-[-2deg] border-2 border-cobalt bg-paper px-4 py-3">
            <p className="meta text-cobalt">{who.building.label}</p>
            <p className="mt-1">
              <a
                href={profile.companyUrl}
                target="_blank"
                rel="noopener"
                className="display text-[length:var(--step-2)] text-cobalt underline decoration-2 underline-offset-4 transition-[text-underline-offset] hover:underline-offset-8"
              >
                {profile.company}
              </a>
            </p>
            <p className="standfirst mt-2 max-w-sm text-ink">“{who.building.note}”</p>
          </div>
        </div>
      </div>
    </Shot>
  );
}

export const WhoShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const words = root.querySelectorAll('[data-scatter]');
    tl.from(words, { yPercent: 120, rotate: 6, autoAlpha: 0, stagger: 0.04, duration: 0.3 }, 0.05)
      .from(root.querySelector('[data-who-lead]'), { autoAlpha: 0, y: 16, duration: 0.2 }, 0.2)
      .from(root.querySelector('[data-who-copy]'), { clipPath: 'inset(0 100% 0 0)', duration: 0.3 }, 0.25)
      .from(root.querySelector('[data-stamp]'), { scale: 2.2, rotate: -18, autoAlpha: 0, duration: 0.2, ease: 'back.out(2)' }, 0.4);
    // After the hold (0.75 × 2 = 1.5s) the words scatter toward the stack diagram.
    words.forEach((w, i) => {
      tl.to(
        w,
        {
          x: gsap.utils.random(-300, 300),
          y: gsap.utils.random(-200, 200),
          rotate: gsap.utils.random(-40, 40),
          autoAlpha: 0,
          duration: 0.35,
        },
        1.55 + i * 0.02,
      );
    });
  },
};
