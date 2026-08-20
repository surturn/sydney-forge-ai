import SceneFrame from '@/components/SceneFrame';

/**
 * Placeholder for a scene not yet built. Renders as a real labelled landmark
 * with its title so the scroll spine, nav dots, and scene progress sampling
 * all work end to end before Stages 2–4 fill these in.
 */
export const SceneStub = ({
  index,
  id,
  label,
  numeral,
}: {
  index: number;
  id: string;
  label: string;
  numeral: string;
}) => (
  <SceneFrame index={index} id={id} label={label} duskOpacity={0.4}>
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <div className="kicker">{numeral} — {label.toUpperCase()}</div>
      <h2 className="display text-[clamp(2rem,6vw,var(--step-5))] text-foreground/25">
        {label}
      </h2>
      <p className="kicker-muted">In production</p>
    </div>
  </SceneFrame>
);

export default SceneStub;
