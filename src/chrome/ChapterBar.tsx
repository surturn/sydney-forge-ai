import { useEffect, useState } from 'react';
import { content } from '@/content';
import { engine } from '@/film/engine';
import type { Chapter } from '@/film/registry';
import { seekToShot } from '@/film/seek';
import { useFilmStore } from '@/film/store';
import { ModeToggle } from './ModeToggle';

const ORDER: Chapter[] = ['cover', 'profile', 'work', 'contact'];

/**
 * Fixed top bar: chapters present in the film, the mode toggle, and the
 * Work-with-me CTA. Shots reserve top padding so it never covers focus.
 */
export function ChapterBar() {
  const activeShot = useFilmStore((s) => s.activeShot);
  // engine.placed is filled by the Stage's layout effect; re-render once it exists.
  const [, force] = useState(0);
  useEffect(() => {
    if (engine.placed.length) force((n) => n + 1);
  }, []);

  const current = engine.placed.find((s) => s.id === activeShot)?.chapter;
  const chapters = ORDER.filter((c) => engine.placed.some((s) => s.chapter === c));

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-ink/15 bg-paper/90 px-4 md:px-8"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <nav aria-label="Chapters" className="flex items-center gap-1 overflow-x-auto py-2">
        {chapters.map((c) => (
          <button
            key={c}
            type="button"
            aria-current={current === c ? 'step' : undefined}
            className={`meta min-h-[28px] px-2 ${current === c ? 'bg-ink text-paper' : 'hover:text-cobalt'}`}
            onClick={() => {
              const first = engine.placed.find((s) => s.chapter === c);
              if (first) seekToShot(first.id);
            }}
          >
            {content.site.chapters[c]}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 py-2">
        <ModeToggle />
        <button type="button" className="btn-signal min-h-[44px] text-sm" onClick={() => seekToShot('back-cover')}>
          Work with me
        </button>
      </div>
    </header>
  );
}
