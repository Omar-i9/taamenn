const MOTION_ATTRIBUTE = 'data-taamen-motion';
const REDUCE = 'reduce';

/** True when the OS asks for reduced motion or the TAAMEN motion switch is off. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.getAttribute(MOTION_ATTRIBUTE) === REDUCE) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Mirrors the Settings motion preference onto the document for CSS and GSAP. */
export function applyMotionPreference(motionEnabled: boolean): void {
  if (typeof document === 'undefined') return;
  if (motionEnabled) document.documentElement.removeAttribute(MOTION_ATTRIBUTE);
  else document.documentElement.setAttribute(MOTION_ATTRIBUTE, REDUCE);
}

/** Pointer parallax is desktop-only: a real pointer plus a desktop viewport. */
export function isParallaxCapable(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && window.matchMedia('(min-width: 901px)').matches;
}

/** Phone and small-tablet widths use shorter travel and fewer simultaneous tweens. */
export function isCompactViewport(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(max-width: 900px)').matches;
}
