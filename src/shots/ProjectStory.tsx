import type { Project } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

type Story = NonNullable<Project['story']>;

/** One project, told as a story: the problem, what I built, what I learned. */
export function makeProjectShot(project: Project & { story: Story }, n: number, of: number): ShotModule {
  const def: ShotDef = { id: `project-${project.id}`, chapter: 'work', length: 2, hold: [0.3, 0.85] };
  const { story } = project;
  const titleId = `shot-${def.id}-title`;
  const beats: { label: string; body: string; tone: string }[] = [
    { label: 'The problem', body: story.problem, tone: 'bg-paper text-ink' },
    { label: 'What I built', body: story.built, tone: 'bg-paper-raised text-ink' },
    ...(story.learned ? [{ label: 'What I learned', body: story.learned, tone: 'bg-cobalt text-paper' }] : []),
  ];
  const links = [
    project.liveUrl && { label: 'See it live ↗', href: project.liveUrl },
    project.repo.url && { label: 'Read the code ↗', href: project.repo.url },
  ].filter(Boolean) as { label: string; href: string }[];

  function Component() {
    return (
      <Shot def={def}>
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-safe-center px-4 pt-20 md:px-8">
          <div className="meta flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2 text-ink">
            <span className="kicker">
              III · Work · {String(n).padStart(2, '0')} / {String(of).padStart(2, '0')}
            </span>
            <span>
              {project.name} · {project.status}
            </span>
          </div>
          <h2 id={titleId} tabIndex={-1} className="display mt-5 max-w-5xl text-[clamp(2.25rem,6vw,var(--step-5))]">
            {story.headline}
          </h2>
          <p data-intro className="standfirst mt-4 max-w-3xl text-[length:var(--step-1)]">
            {story.intro}
          </p>
          <ol className={`mt-6 grid border-2 border-ink ${beats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {beats.map((b, i) => (
              <li
                key={b.label}
                data-beat
                className={`px-4 py-4 ${b.tone} ${i ? 'border-t-2 border-ink md:border-l-2 md:border-t-0' : ''}`}
              >
                <p className={`font-mono text-xs uppercase tracking-[0.12em] ${b.tone.includes('cobalt') ? 'text-paper' : 'text-cobalt'}`}>
                  {b.label}
                </p>
                <p className="mt-2 leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ol>
          <div data-foot className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="meta">Built with {project.stack.join(' · ')}</p>
            {links.length > 0 && (
              <p className="flex gap-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex min-h-[28px] items-center font-medium text-cobalt underline underline-offset-4 hover:underline-offset-8"
                  >
                    {l.label}
                  </a>
                ))}
              </p>
            )}
          </div>
        </div>
      </Shot>
    );
  }

  return {
    def,
    Component,
    build: (tl, root) => {
      // All in before the hold at 0.6s (0.3 × 2).
      tl.from(root.querySelector('h2'), { yPercent: 50, autoAlpha: 0, duration: 0.25 }, 0.05)
        .from(root.querySelector('[data-intro]'), { autoAlpha: 0, y: 14, duration: 0.2 }, 0.15)
        .from(root.querySelectorAll('[data-beat]'), { clipPath: 'inset(0 0 100% 0)', stagger: 0.07, duration: 0.2 }, 0.25)
        .from(root.querySelector('[data-foot]'), { autoAlpha: 0, duration: 0.1 }, 0.48);
    },
  };
}
