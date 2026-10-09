import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'back-cover', chapter: 'contact', length: 2, hold: [0.4, 1] };
const { contact } = content;

const projectMail = `mailto:${contact.email}?subject=${encodeURIComponent(contact.project.subject)}&body=${encodeURIComponent(contact.project.body)}`;

/** The closing invitation: what to bring, one way to start, and the usual links. */
function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
        <div data-livery className="livery" aria-hidden="true" />
        <p className="kicker mt-8">IV · Contact · Over to you</p>
        <h2 id="shot-back-cover-title" tabIndex={-1} className="display mt-3 max-w-5xl text-[clamp(2.75rem,9vw,var(--step-7))]">
          {contact.heading}
        </h2>
        <ul className="mt-6 space-y-1">
          {contact.prompts.map((line) => (
            <li key={line} data-prompt className="standfirst text-[length:var(--step-2)]">
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a data-door href={projectMail} className="btn-signal text-[length:var(--step-1)]">
            {contact.cta}
          </a>
          <a
            data-door
            href={contact.cvPath}
            target="_blank"
            rel="noopener"
            className="meta inline-flex min-h-[44px] items-center px-1 text-ink underline decoration-1 underline-offset-4 hover:text-cobalt"
          >
            Hiring? Here's my CV ↗
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
      .from(root.querySelectorAll('[data-prompt]'), { autoAlpha: 0, x: -16, stagger: 0.05, duration: 0.15 }, 0.35)
      .from(root.querySelectorAll('[data-door]'), { scale: 1.6, rotate: -6, autoAlpha: 0, stagger: 0.08, duration: 0.25, ease: 'back.out(2)' }, 0.45)
      .from(root.querySelectorAll('[data-link]'), { yPercent: 50, autoAlpha: 0, stagger: 0.03, duration: 0.2 }, 0.5);
  },
};
