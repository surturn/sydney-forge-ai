import { create } from 'zustand';

export type Mode = 'film' | 'article';
export type ModeReason = 'default' | 'toggle' | 'reduced-motion' | 'save-data';
export type ReelState = 'pending' | 'playing' | 'paused' | 'done';

export const MODE_KEY = 'film-mode';

export function readStored(key: string, session = false): string | null {
  try {
    return (session ? window.sessionStorage : window.localStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string, session = false): void {
  try {
    (session ? window.sessionStorage : window.localStorage).setItem(key, value);
  } catch {
    /* storage unavailable: the choice simply is not remembered */
  }
}

export function resolveMode(env: { reducedMotion: boolean; saveData: boolean; stored: Mode | null }): {
  mode: Mode;
  reason: ModeReason;
} {
  if (env.stored) return { mode: env.stored, reason: 'toggle' };
  if (env.reducedMotion) return { mode: 'article', reason: 'reduced-motion' };
  if (env.saveData) return { mode: 'article', reason: 'save-data' };
  return { mode: 'film', reason: 'default' };
}

/**
 * Resolve the mode before the first render, so reduced-motion visitors never
 * get a frame of the film engine. useModeBootstrap re-resolves on change.
 */
function initialMode(): { mode: Mode; reason: ModeReason } {
  if (typeof window === 'undefined' || !window.matchMedia) return { mode: 'film', reason: 'default' };
  const stored = readStored(MODE_KEY);
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return resolveMode({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: conn?.saveData === true,
    stored: stored === 'film' || stored === 'article' ? stored : null,
  });
}

const boot = initialMode();

interface FilmState {
  activeShot: string;
  mode: Mode;
  modeReason: ModeReason;
  reelState: ReelState;
  setActiveShot: (id: string) => void;
  setMode: (mode: Mode, reason: ModeReason) => void;
  setReelState: (s: ReelState) => void;
}

/** DISCRETE STATE ONLY. Nothing here changes per frame. */
export const useFilmStore = create<FilmState>((set, get) => ({
  activeShot: 'cover',
  mode: boot.mode,
  modeReason: boot.reason,
  reelState: 'pending',
  setActiveShot: (id) => {
    if (get().activeShot !== id) set({ activeShot: id });
  },
  setMode: (mode, reason) => set({ mode, modeReason: reason }),
  setReelState: (reelState) => set({ reelState }),
}));
