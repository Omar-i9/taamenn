export type HomeReveal = 'cinematic' | 'light';

/**
 * Home plays its full reveal once, right after profile setup hands over to the
 * shell. Every later visit and every reload gets the light reveal instead, so a
 * module flag is enough and no global store is needed.
 */
let pending: HomeReveal = 'light';

export function armCinematicHomeReveal(): void {
  pending = 'cinematic';
}

export function consumeHomeReveal(): HomeReveal {
  const reveal = pending;
  pending = 'light';
  return reveal;
}

export function peekHomeReveal(): HomeReveal {
  return pending;
}
