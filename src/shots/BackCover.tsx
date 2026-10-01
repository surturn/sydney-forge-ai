import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'back-cover', chapter: 'contact', length: 2, hold: [0.4, 1] };
const { contact } = content;

const projectMail = `mailto:${contact.email}?subject=${encodeURIComponent(contact.project.subject)}&body=${encodeURIComponent(contact.project.body)}`;

/** Interim contact page. Stage C replaces it with the three-door back cover. */
function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <div data-livery className="livery" aria-hidden="true" />
        <h2 id="shot-back-cover-title" tabIndex={-1} className="display mt-8 text-[clamp(3rem,11vw,var(--step-7))]">
          {contact.heading}
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <a data-door href={projectMail} className="btn-signal">
            Bring me onto your project
          </a>
          <a data-door href={contact.cvPath} target="_blank" rel="noopener" className="btn-outline">
            Hiring? CV
          </a>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-3 border-t-2 border-ink pt-6 sm:grid-cols-2 md:grid-cols-4">
          {contact.links.map((l) => (
            <li key={l.href} data-link>
              <a
                href={l.href}
                {...(l.kind === 'email' ? {} : { target: '_blank', rel: 'noopener' })}
                className="inline-flex min-h-[28px] items-center font-medium text-cobalt underline underline-offset-4"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="meta mt-10">{contact.colophon}</p>
      </div>
    </Shot>
  );
}

export const BackCoverShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    tl.from(root.querySelector('[data-livery]'), { scaleX: 0, transformOrigin: 'left', duration: 0.3 }, 0.1)
      .from(root.querySelector('h2'), { yPercent: 60, autoAlpha: 0, duration: 0.3 }, 0.25)
      .from(root.querySelectorAll('[data-door]'), { scale: 1.6, rotate: -6, autoAlpha: 0, stagger: 0.08, duration: 0.25, ease: 'back.out(2)' }, 0.45)
      .from(root.querySelectorAll('[data-link]'), { yPercent: 50, autoAlpha: 0, stagger: 0.03, duration: 0.2 }, 0.5);
  },
};
