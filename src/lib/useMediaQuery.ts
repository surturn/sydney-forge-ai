import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Discrete state — changes rarely, so React
 * state is correct here (unlike scroll progress, which must never be).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * True when the horizontal pans should collapse to vertical stacks.
 *
 * `(pointer: coarse)` is real primary-input detection rather than a width
 * proxy, so a touchscreen laptop driven by a trackpad still gets the pan.
 * The width clause catches narrow windows where a 3-panel pan has no room.
 * A coarse-pointer device at desktop width gets the stack, deliberately.
 */
export function useCoarsePointer(): boolean {
  const coarse = useMediaQuery('(pointer: coarse)');
  const narrow = useMediaQuery('(max-width: 767px)');
  return coarse || narrow;
}
