import { engine } from './engine';
import { scrollYFor } from './registry';
import { useFilmStore } from './store';

/**
 * Focus the shot's title. In film mode the target can still be inert here
 * (React has not re-rendered yet, or the scroll passed other shots), and
 * focus() inside an inert subtree is a silent no-op — so lift it first.
 * The Shot's own effect re-applies inert correctly on its next render.
 */
function focusTitle(id: string) {
  document.getElementById(`shot-${id}`)?.removeAttribute('inert');
  document.getElementById(`shot-${id}-title`)?.focus({ preventScroll: true });
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
    useFilmStore.getState().setActiveShot(id);
    if (engine.lenis) {
      // Focus on landing: mid-scroll the playhead passes other shots and re-inerts the target.
      engine.lenis.scrollTo(y, { duration: 1.2, onComplete: () => focusTitle(id) });
      return true;
    }
    window.scrollTo({ top: y });
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
