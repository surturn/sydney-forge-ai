import { projectById } from '@/content';
import { seekToShot } from '@/film/seek';

/** Lime chips linking a claim to the project shot that proves it. */
export function ProofChips({ ids }: { ids: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <a
          key={id}
          href={`#shot-project-${id}`}
          className="chip"
          onClick={(e) => {
            if (seekToShot(`project-${id}`)) e.preventDefault();
          }}
        >
          {projectById(id)?.name}
        </a>
      ))}
    </span>
  );
}
