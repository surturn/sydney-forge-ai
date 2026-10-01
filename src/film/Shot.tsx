import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { ShotDef } from './registry';
import { useFilmStore } from './store';

/**
 * One shot. In film mode every shot is stacked on the stage and only the
 * active one is reachable: the rest are inert (no focus, hidden from AT).
 * In article mode shots are ordinary sections in document order.
 */
export function Shot({ def, className = '', children }: { def: ShotDef; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const hidden = useFilmStore((s) => s.mode === 'film' && s.activeShot !== def.id);

  useLayoutEffect(() => {
    // React 18 does not forward `inert` reliably; set it directly.
    ref.current?.toggleAttribute('inert', hidden);
  }, [hidden]);

  return (
    <section
      ref={ref}
      id={`shot-${def.id}`}
      data-shot={def.id}
      data-chapter={def.chapter}
      aria-labelledby={`shot-${def.id}-title`}
      className={`film-shot ${className}`}
    >
      {children}
    </section>
  );
}
