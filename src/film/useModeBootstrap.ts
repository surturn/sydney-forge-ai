import { useLayoutEffect } from 'react';
import { usePrefersReducedMotion } from '@/lib/useMediaQuery';
import { MODE_KEY, readStored, resolveMode, useFilmStore } from './store';

/** Re-resolves film vs article whenever the motion preference changes. */
export function useModeBootstrap(): void {
  const reducedMotion = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const stored = readStored(MODE_KEY);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const { mode, reason } = resolveMode({
      reducedMotion,
      saveData: conn?.saveData === true,
      stored: stored === 'film' || stored === 'article' ? stored : null,
    });
    useFilmStore.getState().setMode(mode, reason);
  }, [reducedMotion]);
}
