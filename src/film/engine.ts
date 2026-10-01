import type Lenis from 'lenis';
import type { PlacedShot } from './registry';

/** Live handles the seek helper needs. Written by useFilm, read by seek. */
export const engine: { lenis: Lenis | null; placed: PlacedShot[]; spacer: HTMLElement | null } = {
  lenis: null,
  placed: [],
  spacer: null,
};
