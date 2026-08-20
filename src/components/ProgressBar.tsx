import { useEffect, useRef } from 'react';
import { scrollState } from '@/lib/scrollStore';

/**
 * Scroll progress rule. Reads the mutable scrollState imperatively inside its
 * own rAF loop and writes straight to the DOM node's transform — it never
 * holds progress in React state, so it causes zero re-renders.
 */
export const ProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${scrollState.progress})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-px bg-transparent">
      <div
        ref={barRef}
        className="h-full origin-left bg-primary"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};

export default ProgressBar;
