import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SceneFrame from '@/components/SceneFrame';
import { content } from '@/content/content';
import { usePrefersReducedMotion } from '@/lib/useMediaQuery';
import { staggerParent, riseItem } from '@/motion/variants';

/**
 * Scene 0 — the cold open. A scroll-linked perspective push-in: the title
 * grows and recedes on z while sky, sun, ridge and title move at four
 * different rates. Under reduced motion every transform resolves to its
 * resting value and the scene reads as a static title card.
 */
export const Scene0TitleCard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const titleFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const sunY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const ridgeY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  const still = { scale: 1, y: '0%', opacity: 1 };
  const titleStyle = reduce ? still : { scale: titleScale, y: titleY, opacity: titleFade };

  return (
    <SceneFrame index={0} id="cold-open" label="Cold Open" letterbox>
      <div ref={ref} className="relative flex h-screen flex-col items-center justify-center">
        {/* Sun — midground */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: sunY }}
          className="pointer-events-none absolute right-[14%] top-[18%] h-40 w-40 rounded-full blur-[2px]"
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,hsl(38_100%_74%)_0%,hsl(var(--amber))_52%,transparent_74%)]" />
        </motion.div>

        {/* Ridge — foreground */}
        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: ridgeY }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] bg-[hsl(258_45%_5%)]"
          data-testid="ridge"
        />

        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="visible"
          className="pointer-events-none absolute inset-0"
        >
          <motion.div variants={riseItem} className="kicker absolute left-8 top-[8vh]">
            I — COLD OPEN
          </motion.div>
          <motion.div
            variants={riseItem}
            className="kicker-muted absolute right-8 top-[8vh]"
          >
            {content.identity.coords}
          </motion.div>
          <motion.div
            variants={riseItem}
            className="kicker-muted absolute bottom-[10vh] left-0 right-0 text-center"
          >
            {content.identity.role} — {content.identity.location}
          </motion.div>
        </motion.div>

        <motion.h1
          style={titleStyle}
          /* The name is split into per-word blocks for the poster stack; the
             label keeps the accessible name a single, naturally-cased phrase
             rather than the run-together uppercase the spans would produce. */
          aria-label={content.identity.name}
          className="display relative z-10 text-center text-[clamp(3rem,13vw,var(--step-8))] text-foreground"
        >
          {content.identity.name.split(' ').map((word) => (
            <span key={word} className="block">
              {word.toUpperCase()}
            </span>
          ))}
        </motion.h1>
      </div>
    </SceneFrame>
  );
};

export default Scene0TitleCard;
