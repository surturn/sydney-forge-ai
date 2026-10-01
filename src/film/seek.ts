import { engine } from './engine';
import { scrollYFor } from './registry';
import { useFilmStore } from './store';

function focusTitle(id: string) {
  const title = document.getElementById(`shot-${id}-title`);
  title?.focus({ preventScroll: true });
}

function seekOne(id: string): boolean {
  const section = document.getElementById(`shot-${id}`);
  if (!section) return false;
  const film = useFilmStore.getState().mode === 'film';
  const shot = engine.placed.find((s) => s.id === id);

  if (film && shot && engine.spacer) {
    const rect = engine.spacer.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    // +1 lands one pixel inside the hold, so rounding never leaves the playhead on the previous shot.
    const y = scrollYFor(shot.holdStart, top, engine.spacer.offsetHeight, window.innerHeight) + 1;
    if (engine.lenis) engine.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
    useFilmStore.getState().setActiveShot(id);
  } else {
    section.scrollIntoView({ block: 'start' });
  }
  focusTitle(id);
  return true;
}

/**
 * Scrolls to a shot's hold window and moves focus to its title. Tries
 * `fallback` when `id` is not on the page (e.g. a project shot that has not
 * been built yet). Returns whether anything happened.
 */
export function seekToShot(id: string, fallback?: string): boolean {
  if (seekOne(id)) return true;
  return fallback ? seekOne(fallback) : false;
}
