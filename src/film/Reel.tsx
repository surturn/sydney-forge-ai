import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type gsap from 'gsap';
import { useFilmStore, type Mode, type ReelState } from './store';
import { buildReel } from './reelTimeline';
import { ReelControls } from '@/chrome/ReelControls';

/** Who, before what: the person the cover then names. */
const WORDS = ['ENGINEER.', 'FOUNDER.', 'TINKERER.', 'CURIOUS.', 'NAIROBI.'];

/** The reel is the hook: it plays on every load in film mode, reloads included. */
export function shouldPlayReel(mode: Mode): boolean {
  return mode === 'film';
}

/** Whether the reel occupies the screen. 'pending' counts only if it is going to play. */
export function reelIsActive(mode: Mode, reelState: ReelState): boolean {
  if (mode !== 'film') return false;
  if (reelState === 'pending') return shouldPlayReel(mode);
  return reelState === 'playing' || reelState === 'paused';
}

/**
 * The timed cold open. Plays on every load in film mode; Skip, any wheel,
 * touch-move or key press (other than Tab/Shift) ends it at its rest frame.
 */
export function Reel() {
  const mode = useFilmStore((s) => s.mode);
  const reelState = useFilmStore((s) => s.reelState);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const refocus = useRef(false);

  useLayoutEffect(() => {
    if (reelState === 'pending') {
      useFilmStore.getState().setReelState(shouldPlayReel(mode) ? 'playing' : 'done');
    }
  }, [mode, reelState]);

  const finish = useCallback(() => {
    // The focused control is about to unmount; hand focus to the cover instead of <body>.
    refocus.current = !!document.activeElement?.closest('[data-reel-controls]');
    // progress(1) before kill() lands every `from` tween on the cover at rest.
    tlRef.current?.progress(1).kill();
    tlRef.current = null;
    useFilmStore.getState().setReelState('done');
  }, []);

  const active = reelIsActive(mode, reelState);

  // Passive effect: runs after App's layout effect has lifted inert from the page.
  useEffect(() => {
    if (reelState === 'done' && refocus.current) {
      refocus.current = false;
      document.getElementById('shot-cover-title')?.focus({ preventScroll: true });
    }
  }, [reelState]);

  useLayoutEffect(() => {
    if (!active || !overlayRef.current || tlRef.current) return;
    const cover = document.querySelector<HTMLElement>('[data-shot="cover"]');
    const tl = buildReel(overlayRef.current, cover);
    tl.eventCallback('onComplete', finish);
    tlRef.current = tl;
    return () => {
      tlRef.current?.progress(1).kill();
      tlRef.current = null;
    };
  }, [active, finish]);

  useEffect(() => {
    if (!active) return;
    const end = () => finish();
    // Tab and Shift move focus to the reel's own controls, and Enter/Space
    // activate them; none of those may end the reel.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Shift') return;
      if (e.target instanceof Element && e.target.closest('[data-reel-controls]')) return;
      finish();
    };
    const opts = { passive: true } as const;
    window.addEventListener('wheel', end, opts);
    window.addEventListener('touchmove', end, opts);
    // Catches every other way of scrolling (scrollbar drag, autoscroll), so the
    // reel never fights the scrubbed film for the cover's elements.
    window.addEventListener('scroll', end, opts);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', end);
      window.removeEventListener('touchmove', end);
      window.removeEventListener('scroll', end);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, finish]);

  if (!active) return null;

  const playing = reelState !== 'paused';
  const toggle = () => {
    if (playing) tlRef.current?.pause();
    else tlRef.current?.play();
    useFilmStore.getState().setReelState(playing ? 'paused' : 'playing');
  };

  return (
    <>
      <ReelControls playing={playing} onSkip={finish} onToggle={toggle} />
      <div ref={overlayRef} data-reel-overlay aria-hidden="true" className="fixed inset-0 z-[65] overflow-hidden bg-ink">
        <div className="absolute inset-0 flex flex-col justify-center gap-6">
          {['bg-signal', 'bg-cobalt', 'bg-lime'].map((c) => (
            <div key={c} data-reel="stripe" className={`h-[6vh] w-[140vw] ${c}`} />
          ))}
        </div>
        {WORDS.map((w) => (
          <div key={w} className="absolute inset-0 flex items-center justify-center">
            {/* The mask is one line tall, so a word is only visible while it passes through the centre. */}
            <div data-reel="mask" className="overflow-hidden px-[0.05em] py-[0.04em]">
              <span data-reel="word" className="display block translate-y-[110%] whitespace-nowrap text-[clamp(3rem,14vw,14rem)] leading-none text-paper">
                {w}
              </span>
            </div>
          </div>
        ))}
        <svg data-reel="flowline" viewBox="0 0 400 60" className="absolute left-1/2 top-[70%] w-[70vw] -translate-x-1/2" fill="none">
          <path d="M10 30 H390" pathLength={1} strokeDasharray="1" stroke="hsl(var(--paper))" strokeWidth="3" />
          <path data-reel="break" d="M195 15 L205 45" stroke="hsl(var(--signal))" strokeWidth="6" style={{ visibility: 'hidden' }} />
          <circle data-reel="mend" cx="200" cy="30" r="9" fill="hsl(var(--lime))" style={{ visibility: 'hidden' }} />
        </svg>
        <div data-reel="wipe" className="absolute inset-0 bg-paper" style={{ clipPath: 'circle(0% at 50% 50%)' }} />
      </div>
    </>
  );
}
