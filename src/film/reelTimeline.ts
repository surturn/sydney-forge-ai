import gsap from 'gsap';

/**
 * The cold open, ~8.5s. Overlay beats run on a constant ink ground; words
 * slide through rather than cutting, so no large area alternates luminance
 * (WCAG 2.3.1). The cover's own elements are revealed from 3.5s onward, so
 * skipping (progress(1)) always leaves the cover at rest.
 */
export function buildReel(overlay: HTMLElement, cover: HTMLElement | null): gsap.core.Timeline {
  const q = gsap.utils.selector(overlay);
  const c = cover ? gsap.utils.selector(cover) : () => [];
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo(
    q('[data-reel="stripe"]'),
    { xPercent: -120, skewX: -20 },
    { xPercent: 120, skewX: -20, duration: 0.8, stagger: 0.08, ease: 'power2.inOut' },
    0,
  );

  // Each word starts parked below its one-line mask by a CSS translate so nothing
  // flashes before this runs. GSAP would read that as a pixel offset and add it
  // to yPercent, landing exits back at the centre, so y is zeroed here.
  q('[data-reel="word"]').forEach((word: Element, i: number) => {
    const at = 0.8 + i * 0.25;
    tl.fromTo(word, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.14 }, at).to(
      word,
      { yPercent: -110, duration: 0.14, ease: 'power3.in' },
      at + 0.14,
    );
  });

  tl.fromTo(q('[data-reel="flowline"] path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6 }, 2.0)
    .to(q('[data-reel="break"]'), { autoAlpha: 1, duration: 0.05 }, 2.6)
    .to(q('[data-reel="break"]'), { autoAlpha: 0, duration: 0.05 }, 2.95)
    .to(q('[data-reel="mend"]'), { autoAlpha: 1, duration: 0.2 }, 3.0);

  tl.fromTo(
    q('[data-reel="wipe"]'),
    { clipPath: 'circle(0% at 50% 50%)' },
    { clipPath: 'circle(150% at 50% 50%)', duration: 0.9, ease: 'power2.inOut' },
    3.5,
  ).set(overlay, { autoAlpha: 0 }, 4.4);

  tl.from(c('[data-reel="masthead"]'), { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, 3.7)
    .from(c('[data-reel="letter"]'), { yPercent: 100, autoAlpha: 0, duration: 0.5, stagger: 0.12 }, 5.0)
    .from(c('[data-reel="portrait"]'), { clipPath: 'inset(100% 0 0 0)', duration: 1.0, ease: 'power2.out' }, 5.6)
    .from(c('[data-reel="standfirst"]'), { yPercent: 40, autoAlpha: 0, duration: 0.6 }, 7.0)
    .from(c('[data-backdrop]'), { autoAlpha: 0, duration: 0.5 }, 6.4)
    .from(c('[data-reel="cta"]'), { yPercent: 60, autoAlpha: 0, duration: 0.4, stagger: 0.1 }, 7.9);

  return tl;
}
