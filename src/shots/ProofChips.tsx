import { useEffect, useState } from 'react';
import { projectById } from '@/content';
import { engine } from '@/film/engine';
import { seekToShot } from '@/film/seek';

/**
 * Lime chips linking a claim to the project shot that proves it. Until that
 * shot exists (project explainers arrive in Stage B) the chip is a plain
 * label rather than a link that goes nowhere.
 */
export function ProofChips({ ids }: { ids: string[] }) {
  // engine.placed is filled by the Stage's layout effect; re-check once it exists.
  const [, recheck] = useState(0);
  useEffect(() => {
    if (engine.placed.length) recheck((n) => n + 1);
  }, []);

  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const name = projectById(id)?.name;
        const shotId = `project-${id}`;
        if (!engine.placed.some((s) => s.id === shotId)) {
          return (
            <span key={id} className="chip">
              {name}
            </span>
          );
        }
        return (
          <a
            key={id}
            href={`#shot-${shotId}`}
            className="chip"
            onClick={(e) => {
              if (seekToShot(shotId)) e.preventDefault();
            }}
          >
            {name}
          </a>
        );
      })}
    </span>
  );
}
