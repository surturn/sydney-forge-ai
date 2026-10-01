import { MODE_KEY, useFilmStore, writeStored } from '@/film/store';

export function ModeToggle() {
  const mode = useFilmStore((s) => s.mode);
  const next = mode === 'film' ? 'article' : 'film';
  return (
    <button
      type="button"
      aria-label={mode === 'film' ? 'Read as article' : 'Watch as film'}
      className="meta min-h-[28px] shrink-0 px-2 text-ink hover:text-cobalt"
      onClick={() => {
        writeStored(MODE_KEY, next);
        useFilmStore.getState().setMode(next, 'toggle');
        window.scrollTo({ top: 0 });
      }}
    >
      <span className="sm:hidden">{mode === 'film' ? 'Article' : 'Film'}</span>
      <span className="hidden sm:inline">{mode === 'film' ? 'Read as article' : 'Watch as film'}</span>
    </button>
  );
}
