import { config } from './config.mjs';

/**
 * Bounded fixed-window limiter with cooldown.
 *
 * Entries are swept on use and the map is capped, so an attacker rotating source
 * addresses cannot grow it without limit.
 */
export function createRateLimiter(options = {}) {
  const { windowMs, maxAttempts, cooldownMs, maxEntries } = { ...config.rateLimit, ...options };
  const entries = new Map();

  function sweep(now) {
    for (const [key, entry] of entries) {
      const idle = now - entry.first > windowMs;
      const cooled = entry.blockedUntil <= now;
      if (idle && cooled) entries.delete(key);
    }
    if (entries.size <= maxEntries) return;
    // Still over budget: drop the oldest observations first.
    const ordered = [...entries.entries()].sort((a, b) => a[1].first - b[1].first);
    for (const [key] of ordered.slice(0, entries.size - maxEntries)) entries.delete(key);
  }

  return {
    /** Returns true when the attempt may proceed. */
    check(key, now = Date.now()) {
      const entry = entries.get(key) || { count: 0, first: now, blockedUntil: 0 };
      let allowed;
      if (entry.blockedUntil > now) {
        allowed = false;
      } else {
        if (now - entry.first > windowMs) {
          entry.count = 0;
          entry.first = now;
        }
        entry.count += 1;
        if (entry.count > maxAttempts) {
          entry.blockedUntil = now + cooldownMs;
          allowed = false;
        } else {
          allowed = true;
        }
      }
      entries.set(key, entry);
      // Sweep after recording, so the map size can never exceed the cap.
      sweep(now);
      return allowed;
    },

    /** Clear the budget after a legitimate success. */
    reset(key) {
      entries.delete(key);
    },

    get size() {
      return entries.size;
    },
  };
}
