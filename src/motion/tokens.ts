/**
 * TAAMEN motion language.
 *
 * Durations are seconds because GSAP works in seconds; they mirror the
 * `--ta-motion-*` CSS variables so JavaScript and CSS motion stay in step.
 */
export const MOTION = {
  fast: 0.18,
  ui: 0.28,
  panel: 0.36,
  page: 0.4,
  entrance: 0.55,
  cinematic: 1.1,
} as const;

export const EASE = {
  hover: 'power2.out',
  entrance: 'power3.out',
  page: 'power2.inOut',
  exit: 'power2.in',
  ambient: 'sine.inOut',
} as const;

/** Travel distances in pixels. Desktop values; `compact` trims them for phones. */
export const TRAVEL = {
  icon: 28,
  card: 18,
  page: 16,
  auth: 20,
  modal: 16,
  sheet: 34,
  drawer: 32,
} as const;

export const STAGGER = {
  icons: 0.08,
  cards: 0.09,
  form: 0.06,
} as const;

/** Mobile keeps the same rhythm with less travel so it never feels slower. */
export function compact(distance: number): number {
  return Math.round(distance * 0.6);
}
