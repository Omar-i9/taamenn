/** sessionStorage key written by public/404.html on hosts that serve 404.html for unknown paths. */
export const SPA_FALLBACK_KEY = 'taamen-spa-path';

/**
 * Compute the path to restore after a static-host 404 → `/` bounce.
 * Share tokens live in the pathname; they must survive that bounce.
 */
export function spaFallbackNextPath(storedHref: string | null, currentOrigin: string, currentHref: string): string | null {
  if (!storedHref) return null;
  try {
    const stored = new URL(storedHref, currentOrigin);
    const current = new URL(currentHref, currentOrigin);
    if (stored.origin !== current.origin) return null;
    const next = `${stored.pathname}${stored.search}${stored.hash}`;
    const now = `${current.pathname}${current.search}${current.hash}`;
    return next === now ? null : next;
  } catch {
    return null;
  }
}

export function restoreSpaFallbackLocation(): string | null {
  if (typeof sessionStorage === 'undefined' || typeof history === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(SPA_FALLBACK_KEY);
    sessionStorage.removeItem(SPA_FALLBACK_KEY);
    const next = spaFallbackNextPath(stored, location.origin, location.href);
    if (!next) return null;
    history.replaceState(null, '', next);
    return next;
  } catch {
    return null;
  }
}
