import { content } from '@/content';
import { Shot } from '@/film/Shot';
import type { ShotModule } from '@/film/useFilm';
import type { ShotDef } from '@/film/registry';

const def: ShotDef = { id: 'what', chapter: 'profile', length: 3, hold: [0.45, 0.85] };
const { what } = content.profile;
const FILL = ['bg-cobalt text-paper', 'bg-lime text-ink', 'bg-paper-raised text-ink', 'bg-ink text-paper', 'bg-signal text-ink'];

function Component() {
  return (
    <Shot def={def}>
      <div className="mx-auto grid h-full max-w-7xl items-center gap-8 px-4 pt-20 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:px-8">
        <div>
          <p className="kicker">II · Profile · What</p>
          <h2 id="shot-what-title" tabIndex={-1} className="display mt-3 text-[clamp(2.75rem,8vw,var(--step-6))]">
            {what.heading}
          </h2>
          <p data-copy className="mt-5 max-w-lg text-[length:var(--step-0)] leading-relaxed text-ink-muted">
            {what.body}
          </p>
        </div>
        <ul data-stack aria-label="Stack, by layer" className="flex flex-col gap-2 [perspective:900px]">
          {what.layers.map((layer, i) => (
            <li key={layer.name} data-layer={layer.name} className={`border-2 border-ink px-4 py-3 ${FILL[i % FILL.length]}`}>
              <p className="font-mono text-xs uppercase tracking-[0.12em] opacity-90">{layer.name}</p>
              <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {layer.items.map((item) => (
                  <li key={item} data-item className="font-mono text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Shot>
  );
}

export const WhatShot: ShotModule = {
  def,
  Component,
  build: (tl, root) => {
    const layers = [...root.querySelectorAll<HTMLElement>('[data-layer]')];
    tl.from(root.querySelector('h2'), { yPercent: 80, autoAlpha: 0, duration: 0.3 }, 0.1).from(
      root.querySelector('[data-copy]'),
      { autoAlpha: 0, y: 20, duration: 0.3 },
      0.25,
    );
    // Layers assemble alternately from each side, all before the hold at 1.35s (0.45 × 3).
    layers.forEach((layer, i) => {
      const at = 0.35 + i * 0.18;
      tl.from(layer, { xPercent: i % 2 ? 110 : -110, rotateX: 50, autoAlpha: 0, duration: 0.3, ease: 'power3.out' }, at).from(
        layer.querySelectorAll('[data-item]'),
        { yPercent: 100, autoAlpha: 0, stagger: 0.02, duration: 0.15 },
        at + 0.15,
      );
    });
    // Exit after the hold ends at 2.55s.
    tl.to(layers, { rotateX: 12, yPercent: -6, stagger: 0.03, duration: 0.3 }, 2.6).to(
      root.querySelector('[data-stack]'),
      { scale: 0.85, autoAlpha: 0.2, duration: 0.15 },
      2.85,
    );
  },
};
