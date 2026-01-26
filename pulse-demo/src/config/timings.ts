/**
 * Scene timing configuration.
 * Adjust these to match your voiceover audio.
 */

// Scene timings (in seconds)
export const TIMINGS = {
  intro: { start: 0, duration: 5 },
  problem: { start: 5, duration: 7 },
  solution: { start: 12, duration: 10 },
  privacy: { start: 22, duration: 16 },
  incentives: { start: 38, duration: 10 },
  cta: { start: 48, duration: 12 },
} as const;

// Video configuration
export const TOTAL_DURATION = 60; // seconds
export const FPS = 30;

/**
 * Convert seconds to frames
 */
export function toFrames(seconds: number): number {
  return Math.round(seconds * FPS);
}

/**
 * Scene type for type safety
 */
export type SceneName = keyof typeof TIMINGS;
