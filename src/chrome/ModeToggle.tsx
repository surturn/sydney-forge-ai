import { MODE_KEY, useFilmStore, writeStored } from '@/film/store';

export function ModeToggle() {
  const mode = useFilmStore((s) => s.mode);
  const next = mode === 'film' ? 'article' : 'film';
  return (
    <button
      type="button"
      className="meta min-h-[28px] px-2 text-ink hover:text-cobalt"
      onClick={() => {
        writeStored(MODE_KEY, next);
        useFilmStore.getState().setMode(next, 'toggle');
        window.scrollTo({ top: 0 });
      }}
    >
      {mode === 'film' ? 'Read as article' : 'Watch as film'}
    </button>
  );
}
