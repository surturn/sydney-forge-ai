import { Fragment, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SceneFrame from '@/components/SceneFrame';
import { content } from '@/content/content';
import { useCoarsePointer, usePrefersReducedMotion } from '@/lib/useMediaQuery';

const PANELS = content.scene1.panels;

const StackRail = () => (
  <ul
    aria-label="Technical stack"
    className="grid gap-6 sm:grid-cols-2"
  >
    {content.scene1.stack.map((group) => (
      <li key={group.group}>
        <div className="kicker mb-3">{group.group}</div>
        <div className="flex flex-wrap gap-2">
          {group.items.map((item) => (
            <span
              key={item}
              className="border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </li>
    ))}
  </ul>
);

const Panel = ({ index }: { index: number }) => {
  const panel = PANELS[index];
  return (
    <div className="relative flex h-screen w-screen shrink-0 flex-col justify-center px-8 md:px-20">
      <div aria-hidden="true"
        className="display pointer-events-none absolute -bottom-16 right-0 text-[28vw] leading-none text-foreground/[0.045]">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="kicker mb-6">{panel.kicker}</div>
      {/* Lines are direct text nodes of the h2 separated by <br>, not wrapped
          in block spans: that keeps the heading a single readable string for
          assistive tech and find-in-page, while still breaking visually. */}
      <h2 className="display max-w-3xl text-[clamp(2.2rem,7vw,var(--step-6))] text-foreground">
        {panel.heading.map((line, i) => (
          <Fragment key={line}>
            {line}
            {i < panel.heading.length - 1 ? <br /> : null}
            {i < panel.heading.length - 1 ? ' ' : ''}
          </Fragment>
        ))}
      </h2>
      {panel.body && (
        <p className="mt-8 max-w-xl text-[length:var(--step-0)] leading-relaxed text-muted-foreground">
          {panel.body}
        </p>
      )}
      {index === PANELS.length - 1 && (
        <div className="mt-10 max-w-3xl">
          <StackRail />
        </div>
      )}
    </div>
  );
};

/**
 * Scene 1 — Personal. Three panels panned horizontally by vertical scroll.
 *
 * This is scroll-LINKED, not scroll-jacked: the section is simply tall, an
 * inner track is sticky, and translateX is derived from the section's own
 * scroll progress. No wheel/touch/key event is ever intercepted, so keyboard
 * paging, find-in-page and screen readers behave normally.
 */
export const Scene1Personal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const stacked = useCoarsePointer();
  const reduce = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const shift = -100 * (PANELS.length - 1);
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `${shift}%`]);

  if (stacked || reduce) {
    return (
      <SceneFrame index={1} id="personal" label="Personal" duskOpacity={0.55}>
        <div ref={ref} data-testid="scene1-track" data-layout="stacked">
          {PANELS.map((panel, i) => (
            <Panel key={panel.kicker} index={i} />
          ))}
        </div>
      </SceneFrame>
    );
  }

  return (
    <SceneFrame index={1} id="personal" label="Personal" duskOpacity={0.55}>
      <div ref={ref} style={{ height: `${PANELS.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            data-testid="scene1-track"
            data-layout="horizontal"
            style={{ x }}
            className="flex h-full"
          >
            {PANELS.map((panel, i) => (
              <Panel key={panel.kicker} index={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </SceneFrame>
  );
};

export default Scene1Personal;
