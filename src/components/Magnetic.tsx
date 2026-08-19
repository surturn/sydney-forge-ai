import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface MagneticProps {
  children: ReactNode;
  /** Fraction of cursor offset applied (kept low for restraint). */
  strength?: number;
  /** Max travel in px — gentle by design. */
  max?: number;
  className?: string;
}

/*
 * Gentle magnetic pull toward the cursor for primary CTAs. Capped travel,
 * heavily damped (no bounce/overshoot), and fully disabled under
 * prefers-reduced-motion.
 */
export const Magnetic = ({
  children,
  strength = 0.3,
  max = 7,
  className = '',
}: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 26, mass: 0.2 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-max, Math.min(max, dx * strength)));
    y.set(Math.max(-max, Math.min(max, dy * strength)));
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy, display: 'inline-flex' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
