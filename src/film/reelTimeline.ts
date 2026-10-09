import gsap from 'gsap';

/** Montage pacing: each word slides in, holds long enough to read, slides out. */
const WORD_IN = 0.25;
const WORD_HOLD = 0.45;
const WORD_OUT = 0.25;
const WORD_STEP = WORD_IN + WORD_HOLD + WORD_OUT;

/**
 * The cold open, ~13s. Overlay beats run on a constant ink ground; words
 * slide through rather than cutting, so no large area alternates luminance
 * (WCAG 2.3.1). The cover's own elements are revealed from ~7.3s onward, so
 * skipping (progress(1)) always leaves the cover at rest.
 */
export function buildReel(overlay: HTMLElement, cover: HTMLElement | null): gsap.core.Timeline {
  const q = gsap.utils.selector(overlay);
  const c = cover ? gsap.utils.selector(cover) : () => [];
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 0.0–1.2  livery stripes pass like a matatu
  tl.fromTo(
    q('[data-reel="stripe"]'),
    { xPercent: -120, skewX: -20 },
    { xPercent: 120, skewX: -20, duration: 1.2, stagger: 0.12, ease: 'power2.inOut' },
    0,
  );

  // 1.3–5.05  montage: ENGINEER. FOUNDER. TINKERER. CURIOUS. NAIROBI.
  // Each word starts parked below its one-line mask by a CSS translate so nothing
  // flashes before this runs. GSAP reads that as a pixel offset and adds it to
  // yPercent, so words land off-centre and overlap. Zero y so only yPercent moves.
  q('[data-reel="word"]').forEach((word: Element, i: number) => {
    const at = 1.3 + i * WORD_STEP;
    tl.fromTo(word, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: WORD_IN }, at).to(
      word,
      { yPercent: -110, duration: WORD_OUT, ease: 'power3.in' },
      at + WORD_IN + WORD_HOLD,
    );
  });

  // 5.2–6.8  a payment line draws, snaps, and mends
  tl.fromTo(q('[data-reel="flowline"] path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9 }, 5.2)
    .to(q('[data-reel="break"]'), { autoAlpha: 1, duration: 0.05 }, 6.1)
    .to(q('[data-reel="break"]'), { autoAlpha: 0, duration: 0.05 }, 6.5)
    .to(q('[data-reel="mend"]'), { autoAlpha: 1, duration: 0.3 }, 6.55);

  // 7.0–8.2  paper floods out from the centre
  tl.fromTo(
    q('[data-reel="wipe"]'),
    { clipPath: 'circle(0% at 50% 50%)' },
    { clipPath: 'circle(150% at 50% 50%)', duration: 1.2, ease: 'power2.inOut' },
    7.0,
  ).set(overlay, { autoAlpha: 0 }, 8.2);

  // 7.3–12.9  the cover assembles
  tl.from(c('[data-reel="masthead"]'), { yPercent: -100, autoAlpha: 0, duration: 0.6, ease: 'back.out(2)' }, 7.3)
    .from(c('[data-reel="letter"]'), { yPercent: 100, autoAlpha: 0, duration: 0.6, stagger: 0.15 }, 8.4)
    .from(c('[data-reel="portrait"]'), { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'power2.out' }, 9.2)
    .from(c('[data-reel="standfirst"]'), { yPercent: 40, autoAlpha: 0, duration: 0.8 }, 10.8)
    .from(c('[data-reel="chip"]'), { scale: 0, rotate: -12, duration: 0.5, stagger: 0.15, ease: 'back.out(3)' }, 11.4)
    .from(c('[data-reel="cta"]'), { yPercent: 60, autoAlpha: 0, duration: 0.5, stagger: 0.15 }, 12.2);

  // Without a cover (tests, or a shot list without one) the timeline still runs its full length.
  tl.set({}, {}, 12.9);
  return tl;
}
