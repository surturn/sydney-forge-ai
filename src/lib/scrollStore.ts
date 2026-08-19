import { useEffect } from 'react';
import Lenis from 'lenis';
import { create } from 'zustand';
import { SCENES } from '@/content/content';
import { usePrefersReducedMotion, useCoarsePointer } from '@/lib/useMediaQuery';

export interface SceneProgress {
  /** 0 before the scene enters the viewport, 1 once it has fully left. */
  progress: number;
  visible: boolean;
}

/**
 * CONTINUOUS SCROLL STATE — a plain mutable object, deliberately NOT React
 * state and deliberately NOT in zustand.
 *
 * This is updated in place once per animation frame. Consumers read it
 * imperatively (R3F's useFrame, Framer Motion transforms). If this lived in
 * reactive state, every subscriber would re-render 60 times a second, which
 * is exactly the jank a cinematic scroll cannot survive.
 */
export const scrollState: {
  progress: number;
  velocity: number;
  scenes: SceneProgress[];
} = {
  progress: 0,
  velocity: 0,
  scenes: SCENES.map(() => ({ progress: 0, visible: false })),
};

/**
 * Progress of one scene through the viewport.
 * Travel spans from "top edge at the bottom of the viewport" (0) to
 * "bottom edge at the top of the viewport" (1).
 */
export function computeSceneProgress(
  top: number,
  height: number,
  viewportHeight: number,
): SceneProgress {
  const travel = viewportHeight + height;
  const raw = travel === 0 ? 0 : (viewportHeight - top) / travel;
  const progress = Math.min(1, Math.max(0, raw));
  const visible = top < viewportHeight && top + height > 0;
  return { progress, visible };
}

/** The scene a reader is most plausibly looking at. */
export function activeSceneFrom(scenes: SceneProgress[]): number {
  let best = -1;
  let bestDistance = Infinity;

  scenes.forEach((scene, i) => {
    if (!scene.visible) return;
    const distance = Math.abs(scene.progress - 0.5);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });

  if (best !== -1) return best;

  // Nothing visible (between scenes, or mid-jump): the last one fully passed.
  let lastPassed = 0;
  scenes.forEach((scene, i) => {
    if (scene.progress >= 1) lastPassed = i;
  });
  return lastPassed;
}

interface SceneStore {
  activeScene: number;
  reducedMotion: boolean;
  coarsePointer: boolean;
  webglSupported: boolean | null;
  setActiveScene: (index: number) => void;
  setEnv: (patch: Partial<Pick<SceneStore, 'reducedMotion' | 'coarsePointer' | 'webglSupported'>>) => void;
}

/**
 * DISCRETE STATE ONLY. Everything here changes rarely — a handful of times
 * across a whole scroll. Nothing that changes per frame belongs in this store.
 */
export const useSceneStore = create<SceneStore>((set) => ({
  activeScene: 0,
  reducedMotion: false,
  coarsePointer: false,
  webglSupported: null,
  setActiveScene: (index) =>
    set((state) => (state.activeScene === index ? state : { ...state, activeScene: index })),
  setEnv: (patch) => set((state) => ({ ...state, ...patch })),
}));

const sceneElements: (HTMLElement | null)[] = SCENES.map(() => null);

export function registerScene(index: number, el: HTMLElement | null): void {
  sceneElements[index] = el;
}

/**
 * Mounts the scroll engine. Call exactly once, from App.
 *
 * Lenis drives NATIVE document scroll rather than transforming a container,
 * so keyboard paging, find-in-page, and assistive technology keep working.
 * Under prefers-reduced-motion Lenis never initialises and we fall back to a
 * plain scroll listener, leaving the browser's own scrolling untouched.
 */
export function useScrollEngine(): void {
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useCoarsePointer();
  const setActiveScene = useSceneStore((s) => s.setActiveScene);
  const setEnv = useSceneStore((s) => s.setEnv);

  useEffect(() => {
    setEnv({ reducedMotion, coarsePointer });
  }, [reducedMotion, coarsePointer, setEnv]);

  useEffect(() => {
    let lastY = window.scrollY;

    const sample = () => {
      const viewportHeight = window.innerHeight;
      const limit = document.documentElement.scrollHeight - viewportHeight;
      const y = window.scrollY;

      scrollState.progress = limit > 0 ? y / limit : 0;
      scrollState.velocity = y - lastY;
      lastY = y;

      sceneElements.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        scrollState.scenes[i] = computeSceneProgress(rect.top, rect.height, viewportHeight);
      });

      setActiveScene(activeSceneFrom(scrollState.scenes));
    };

    if (reducedMotion) {
      sample();
      window.addEventListener('scroll', sample, { passive: true });
      window.addEventListener('resize', sample);
      return () => {
        window.removeEventListener('scroll', sample);
        window.removeEventListener('resize', sample);
      };
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      sample();
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion, setActiveScene]);
}
