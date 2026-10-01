import { useMemo, useRef } from 'react';
import { useFilm, type ShotModule } from './useFilm';
import { useFilmStore } from './store';

/**
 * The film. In film mode a tall spacer provides the scroll range and the
 * stage sticks to the viewport inside it. In article mode the spacer has no
 * fixed height and shots flow as a normal document.
 */
export function Stage({ shots }: { shots: ShotModule[] }) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mode = useFilmStore((s) => s.mode);
  const film = mode === 'film';
  const total = useMemo(() => shots.reduce((sum, s) => sum + s.def.length, 0), [shots]);

  useFilm(spacerRef, stageRef, shots, film);

  return (
    <div
      ref={spacerRef}
      data-film-spacer
      data-mode={mode}
      data-length={total}
      style={film ? { height: `calc(${total * 100} * 1svh)` } : undefined}
    >
      <div ref={stageRef} className="film-stage">
        {shots.map(({ def, Component }) => (
          <Component key={def.id} />
        ))}
      </div>
    </div>
  );
}
