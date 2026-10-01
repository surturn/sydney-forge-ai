import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { placeShots, shotAt, type PlacedShot, type ShotDef } from './registry';
import { useFilmStore } from './store';
import { engine } from './engine';
import { scrollState } from '@/lib/scrollStore';

export type ShotBuild = (tl: gsap.core.Timeline, root: HTMLElement, shot: PlacedShot) => void;

export interface ShotModule {
  def: ShotDef;
  Component: () => JSX.Element;
  build?: ShotBuild;
}

gsap.registerPlugin(ScrollTrigger);

/**
 * Builds the film: Lenis smooths native scroll, ScrollTrigger maps the
 * spacer's scroll range onto one master timeline made of each shot's
 * sub-timeline. Everything is created inside a gsap.context and reverted on
 * cleanup, so remounts (StrictMode, HMR, mode toggles) never stack triggers.
 */
export function useFilm(
  spacerRef: RefObject<HTMLElement>,
  stageRef: RefObject<HTMLElement>,
  shots: ShotModule[],
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    const spacer = spacerRef.current;
    const stage = stageRef.current;
    const { placed, total } = placeShots(shots.map((s) => s.def));
    engine.placed = placed;
    engine.spacer = spacer;
    if (!enabled || !spacer || !stage) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    engine.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const setActive = useFilmStore.getState().setActiveShot;
    let lastY = window.scrollY;

    const ctx = gsap.context(() => {
      const master = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
      placed.forEach((shot, i) => {
        const root = stage.querySelector<HTMLElement>(`[data-shot="${shot.id}"]`);
        if (!root) return;
        const sub = gsap.timeline();
        if (i > 0) {
          sub.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: Math.min(0.3, shot.hold[0] * shot.length) }, 0);
        }
        shots[i].build?.(sub, root, shot);
        if (i < placed.length - 1) {
          const out = Math.min(0.3, (1 - shot.hold[1]) * shot.length);
          sub.to(root, { autoAlpha: 0, duration: out }, shot.length - out);
        }
        sub.set({}, {}, shot.length);
        master.add(sub, shot.start * total);
      });

      ScrollTrigger.create({
        trigger: spacer,
        start: 'top top',
        end: 'bottom bottom',
        animation: master,
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
          scrollState.velocity = window.scrollY - lastY;
          lastY = window.scrollY;
          setActive(shotAt(placed, self.progress).id);
        },
      });
    }, stage);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default; the setting is global
      lenis.destroy();
      engine.lenis = null;
    };
  }, [spacerRef, stageRef, shots, enabled]);
}
