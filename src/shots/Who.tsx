import gsap from 'gsap';
import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'who', chapter: 'profile', length: 2, hold: [0.3, 0.75] };
const { profile } = content;

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-safe-center gap-10 px-4 pt-20 md:grid-cols-[1fr_1fr] md:px-8">
        <div>
          <p className="kicker">II · Profile · Who</p>
          <h2 id="shot-who-title" tabIndex={-1} className="display mt-3 text-[clamp(3rem,10vw,var(--step-7))]">
            {/* Readable name for AT; the animated words are decorative copies. */}
            <span className="sr-only">{profile.who.heading}</span>
            <span aria-hidden="true">
              {profile.who.heading.split(' ').map((w, i) => (
                <span key={i} data-scatter className="inline-block pr-[0.2em]">
                  {w}
                </span>
              ))}
            </span>
          </h2>
        </div>
        <div data-who-copy className="border-l-2 border-ink pl-6">
          <p className="text-[length:var(--step-1)] leading-snug">{profile.who.body}</p>
          <div data-stamp className="mt-8 inline-block rotate-[-3deg] border-2 border-cobalt px-4 py-3">
            <p className="meta text-cobalt">On the side</p>
            <p className="mt-1">
              <a
                href={profile.companyUrl}
                target="_blank"
                rel="noopener"
                className="font-medium text-cobalt underline underline-offset-4"
              >
                {profile.company}
              </a>
            </p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">{profile.who.invonics}</p>
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
    tl.from(words, { yPercent: 120, rotate: 6, autoAlpha: 0, stagger: 0.08, duration: 0.3 }, 0.05)
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
