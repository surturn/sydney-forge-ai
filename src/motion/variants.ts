import type { Variants } from 'framer-motion';

/** Mirrors --ease-cinematic. A strong ease-out settle. Never springy. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = { reveal: 0.7, line: 0.8, rule: 0.6 } as const;

export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE } },
};

/** Masked line: translates up from behind an overflow-hidden clip. */
export const lineRise: Variants = {
  hidden: { y: '115%' },
  visible: { y: '0%', transition: { duration: DURATION.line, ease: EASE } },
};

export const inView = { once: true, margin: '0px 0px -12% 0px' } as const;
