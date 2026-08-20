import { useEffect, useRef, type ReactNode } from 'react';
import { registerScene } from '@/lib/scrollStore';

interface SceneFrameProps {
  index: number;
  id: string;
  label: string;
  children: ReactNode;
  /** Black bars top and bottom — the cinematic frame. */
  letterbox?: boolean;
  /** Opacity of the dusk gradient, 0–1. Scenes vary this for depth. */
  duskOpacity?: number;
  className?: string;
}

/**
 * Shared scene wrapper. Registers the section with the scroll engine so its
 * progress is sampled each frame, and paints the two decorative layers every
 * scene shares: the dusk gradient and the film grain. Both are aria-hidden —
 * no decoration ever carries information.
 */
export const SceneFrame = ({
  index,
  id,
  label,
  children,
  letterbox = false,
  duskOpacity = 1,
  className = '',
}: SceneFrameProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerScene(index, ref.current);
    return () => registerScene(index, null);
  }, [index]);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-scene={index}
      className={`relative isolate overflow-hidden bg-background ${className}`}
    >
      <div
        data-decoration="dusk"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dusk-bg"
        style={{ opacity: duskOpacity }}
      />
      <div
        data-decoration="grain"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '150px 150px',
        }}
      />
      {letterbox && (
        <>
          <div data-decoration="bar-top" aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[6vh] bg-[hsl(258_45%_4%)]" />
          <div data-decoration="bar-bottom" aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[6vh] bg-[hsl(258_45%_4%)]" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  );
};

export default SceneFrame;
