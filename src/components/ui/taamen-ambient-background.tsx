import { useRef } from 'react';
import { gsap, useGSAP } from '../../motion/gsapRuntime';
import { isParallaxCapable, prefersReducedMotion } from '../../motion/prefersReduced';

export type AmbientVariant = 'home' | 'auth';

type TaamenAmbientBackgroundProps = {
  /** `auth` is slightly more cinematic; `home` stays quieter behind content. */
  variant?: AmbientVariant;
  /** Fades out without unmounting so routes crossfade instead of cutting. */
  active?: boolean;
};

/** Maximum pointer displacement in pixels. The layers lag behind the cursor. */
const PRIMARY_SHIFT = { x: 16, y: 12 };
const SECONDARY_SHIFT = { x: -10, y: -8 };

/**
 * Decorative TAAMEN atmosphere: layered radial light on a deep teal field.
 *
 * Movement is CSS driven (independent slow loops) so it never depends on
 * JavaScript. GSAP only adds desktop pointer parallax, which is where it has a
 * real advantage over CSS.
 */
export default function TaamenAmbientBackground({ variant = 'home', active = true }: TaamenAmbientBackgroundProps) {
  const root = useRef<HTMLDivElement>(null);
  const primaryLayer = useRef<HTMLDivElement>(null);
  const secondaryLayer = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const primary = primaryLayer.current;
    const secondary = secondaryLayer.current;
    if (!active || !primary || !secondary) return;
    if (!isParallaxCapable() || prefersReducedMotion()) return;

    const tween = { duration: 0.9, ease: 'power3.out' } as const;
    const primaryX = gsap.quickTo(primary, 'x', tween);
    const primaryY = gsap.quickTo(primary, 'y', tween);
    const secondaryX = gsap.quickTo(secondary, 'x', tween);
    const secondaryY = gsap.quickTo(secondary, 'y', tween);

    const settle = () => {
      primaryX(0);
      primaryY(0);
      secondaryX(0);
      secondaryY(0);
    };

    // quickTo reuses one tween per property, so no React state or rAF loop is needed.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || prefersReducedMotion()) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      primaryX(x * PRIMARY_SHIFT.x);
      primaryY(y * PRIMARY_SHIFT.y);
      secondaryX(x * SECONDARY_SHIFT.x);
      secondaryY(y * SECONDARY_SHIFT.y);
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('blur', settle);
    document.documentElement.addEventListener('mouseleave', settle);
    reduced.addEventListener('change', settle);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('blur', settle);
      document.documentElement.removeEventListener('mouseleave', settle);
      reduced.removeEventListener('change', settle);
    };
  }, { dependencies: [active], revertOnUpdate: true, scope: root });

  return (
    <div ref={root} className="ta-atmos" data-variant={variant} data-active={active} aria-hidden="true">
      <div className="ta-atmos-zoom">
        <div className="ta-atmos-base" />
      </div>
      <div ref={primaryLayer} className="ta-atmos-shift">
        <div className="ta-atmos-glow is-primary" />
      </div>
      <div ref={secondaryLayer} className="ta-atmos-shift">
        <div className="ta-atmos-glow is-secondary" />
      </div>
      <div className="ta-atmos-illumination" />
      <div className="ta-atmos-vignette" />
    </div>
  );
}
