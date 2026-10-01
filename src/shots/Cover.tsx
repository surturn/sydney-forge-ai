import { content, projectById } from '@/content';
import { Shot } from '@/film/Shot';
import { seekToShot } from '@/film/seek';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';
import { Figure } from './Figure';

const def: ShotDef = { id: 'cover', chapter: 'cover', length: 1.5, hold: [0, 0.55] };
const { profile, site, contact } = content;

function Component() {
  const [first, last] = profile.name.toUpperCase().split(' ');
  return (
    <Shot def={def} className="paper-texture">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 pt-16 md:px-8">
        <div data-reel="masthead" className="meta flex justify-between border-b-2 border-ink py-2 text-ink">
          <span>Issue {site.issue} · Nairobi</span>
          <span className="hidden sm:inline">{profile.coords}</span>
          <span>{site.issueDate}</span>
        </div>
        <div className="livery mt-2" aria-hidden="true" />

        <div className="grid flex-1 items-center gap-8 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <p className="kicker">{profile.cover.kicker}</p>
            <h1 id="shot-cover-title" tabIndex={-1} className="display mt-3 text-[clamp(3.5rem,13vw,var(--step-8))] text-ink">
              <span className="sr-only">{profile.name}</span>
              <span aria-hidden="true">
                {[first, last].map((word) => (
                  <span key={word} className="block overflow-hidden">
                    {[...word].map((ch, i) => (
                      <span key={i} data-reel="letter" className="inline-block">
                        {ch}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </h1>
            <p data-reel="standfirst" className="standfirst mt-5 max-w-xl text-[length:var(--step-1)] text-ink">
              {profile.cover.standfirst}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Featured work">
              {profile.cover.chips.map((id) => (
                <li key={id} data-reel="chip">
                  <a
                    href={`#shot-project-${id}`}
                    className="chip"
                    onClick={(e) => {
                      if (seekToShot(`project-${id}`, 'solves')) e.preventDefault();
                    }}
                  >
                    {projectById(id)?.name} ↓
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                data-reel="cta"
                href="#shot-back-cover"
                className="btn-signal"
                onClick={(e) => {
                  if (seekToShot('back-cover')) e.preventDefault();
                }}
              >
                Work with me
              </a>
              <a data-reel="cta" href={contact.cvPath} target="_blank" rel="noopener" className="btn-outline">
                Hiring? CV
              </a>
            </div>
          </div>
          <Figure
            media={profile.portrait}
            caption="Fig. 1 — the engineer, Nairobi"
            priority
            className="mx-auto w-[min(70vw,22rem)] md:w-full"
          />
        </div>
      </div>
    </Shot>
  );
}

export const CoverShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const q = (s: string) => root.querySelectorAll(s);
    tl.to(q('[data-reel="masthead"]'), { yPercent: -60, autoAlpha: 0, duration: 0.3 }, 0.9)
      .to(q('figure'), { scale: 1.25, yPercent: -8, duration: 0.6, ease: 'power2.in' }, 0.85)
      .to(
        q('h1, [data-reel="standfirst"], ul, [data-reel="cta"]'),
        { yPercent: -30, autoAlpha: 0, stagger: 0.04, duration: 0.35 },
        0.95,
      );
  },
};
