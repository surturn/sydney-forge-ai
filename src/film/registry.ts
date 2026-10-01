export type Chapter = 'cover' | 'profile' | 'work' | 'contact';

export interface ShotDef {
  id: string;
  chapter: Chapter;
  /** Scroll length in viewport-heights. */
  length: number;
  /** Fraction window [0..1] of the shot during which nothing moves. */
  hold: [number, number];
}

export interface PlacedShot extends ShotDef {
  /** All four are positions in master-timeline progress, 0..1. */
  start: number;
  end: number;
  holdStart: number;
  holdEnd: number;
}

export function validateShots(shots: ShotDef[]): void {
  const seen = new Set<string>();
  for (const s of shots) {
    if (seen.has(s.id)) throw new Error(`duplicate shot id "${s.id}"`);
    seen.add(s.id);
    if (!(s.length > 0)) throw new Error(`shot "${s.id}": length must be > 0`);
    const [a, b] = s.hold;
    if (a < 0 || b > 1 || a >= b) throw new Error(`shot "${s.id}": hold must satisfy 0 <= start < end <= 1`);
  }
}

export function placeShots(shots: ShotDef[]): { placed: PlacedShot[]; total: number } {
  validateShots(shots);
  const total = shots.reduce((sum, s) => sum + s.length, 0);
  let cursor = 0;
  const placed = shots.map((s) => {
    const start = cursor / total;
    cursor += s.length;
    const end = cursor / total;
    const span = end - start;
    return { ...s, start, end, holdStart: start + s.hold[0] * span, holdEnd: start + s.hold[1] * span };
  });
  return { placed, total };
}

export function shotAt(placed: PlacedShot[], progress: number): PlacedShot {
  const p = Math.min(1, Math.max(0, progress));
  return placed.find((s) => p >= s.start && p < s.end) ?? placed[placed.length - 1];
}

export function scrollYFor(progress: number, spacerTop: number, spacerHeight: number, viewport: number): number {
  return spacerTop + progress * Math.max(0, spacerHeight - viewport);
}
