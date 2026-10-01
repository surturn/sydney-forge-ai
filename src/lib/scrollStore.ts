/**
 * CONTINUOUS SCROLL STATE — a plain mutable object, deliberately NOT React
 * state. The film engine writes it once per frame; anything that needs it
 * reads it imperatively. If this were reactive, every subscriber would
 * re-render 60 times a second.
 */
export const scrollState: { progress: number; velocity: number } = {
  progress: 0,
  velocity: 0,
};
