import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from './gsapRuntime';
import { EASE, MOTION, TRAVEL, compact } from './tokens';
import { isCompactViewport, prefersReducedMotion } from './prefersReduced';
import type { RouteId } from '../config/routes';

type StageProfile = { travel: number; duration: number };

/**
 * Motion per route purpose. Data-heavy pages stay short and functional, Home
 * skips the wrapper entirely because it choreographs its own groups, and the
 * tactical board only fades so no transform can ever fight the drag logic.
 */
const STAGE: Record<RouteId | 'default', StageProfile> = {
  default: { travel: TRAVEL.page, duration: MOTION.page },
  home: { travel: 0, duration: 0 },
  archive: { travel: 12, duration: 0.34 },
  'match-center': { travel: 12, duration: 0.34 },
  'historical-match-center': { travel: 12, duration: 0.34 },
  stadiums: { travel: 12, duration: 0.34 },
  profile: { travel: 14, duration: 0.38 },
  support: { travel: 14, duration: 0.38 },
  settings: { travel: 0, duration: 0.26 },
  tactical: { travel: 0, duration: 0.26 },
};

/**
 * Plays the incoming half of a route change. The route has already switched by
 * the time this runs, so navigation never waits for motion.
 */
export default function PageStage({ page, children }: { page: RouteId; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = stage.current;
    if (!el) return;
    const profile = STAGE[page] ?? STAGE.default;
    if (profile.duration === 0) return;

    if (prefersReducedMotion()) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'none', clearProps: 'opacity' });
      return;
    }

    const travel = isCompactViewport() ? compact(profile.travel) : profile.travel;
    gsap.fromTo(
      el,
      travel > 0 ? { opacity: 0, y: travel } : { opacity: 0 },
      travel > 0
        ? { opacity: 1, y: 0, duration: profile.duration, ease: EASE.entrance, clearProps: 'opacity,transform' }
        : { opacity: 1, duration: profile.duration, ease: EASE.entrance, clearProps: 'opacity' },
    );
  }, { dependencies: [page], revertOnUpdate: true });

  return <div ref={stage} className="page-stage">{children}</div>;
}
