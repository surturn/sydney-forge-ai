import { useLayoutEffect, type RefObject } from 'react';

/** Never shrink a shot below this, so text stays legible. */
const FLOOR = 0.6;

/** Scale that makes content of `content` px fit a frame of `available` px. */
export function fitScale(content: number, available: number, floor = FLOOR): number {
  if (content <= 0 || available <= 0) return 1;
  return Math.max(floor, Math.min(1, available / content));
}

/**
 * Film mode pins every shot to one viewport, so a shot taller than a phone
 * screen would be clipped with no way to scroll to the rest. Like a video
 * fit to its frame, the shot's content is scaled down until it fits.
 * Article mode scrolls normally and is left untouched.
 */
export function useFitToFrame(ref: RefObject<HTMLElement>, enabled: boolean): void {
  useLayoutEffect(() => {
    const el = ref.current;
    const frame = el?.parentElement;
    if (!el || !frame) return;
    if (!enabled) {
      el.style.transform = '';
      return;
    }

    const apply = () => {
      el.style.transform = '';
      const s = fitScale(el.scrollHeight, frame.clientHeight);
      el.style.transformOrigin = 'top center';
      el.style.transform = s < 1 ? `scale(${s})` : '';
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(frame);
    // Web fonts change text metrics after first layout.
    document.fonts?.ready.then(apply).catch(() => {});
    return () => ro.disconnect();
  }, [ref, enabled]);
}
