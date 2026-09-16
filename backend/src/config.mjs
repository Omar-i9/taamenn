import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MINUTE = 60_000;

function bool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

/**
 * Deployment topology is configuration, not an assumption. `CORS_ORIGIN` is only
 * consulted when the API is served from a different origin than the app; a
 * same-origin deployment needs no CORS at all.
 */
export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // File locations are overridable so tests can run against a temporary dataset.
  dataFile: process.env.TAAMEN_DATA_FILE || path.join(ROOT, 'data.json'),
  exampleDataFile: process.env.TAAMEN_EXAMPLE_DATA_FILE || path.join(ROOT, 'data.example.json'),
  sessionFile: process.env.TAAMEN_SESSION_FILE || path.join(ROOT, 'sessions.json'),
  legacyFile: process.env.TAAMEN_LEGACY_FILE || path.join(ROOT, 'legacy-private-matches.json'),

  sessionTtlMs: Math.max(15 * MINUTE, Number(process.env.SESSION_TTL_MS || 8 * 60 * MINUTE)),
  sessionCookieName: 'taamen_session',

  /** Explicit allow-list. Empty means same-origin only. */
  allowedOrigins: String(process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean),

  requireHttps: bool(process.env.REQUIRE_HTTPS),

  /**
   * Only honour forwarded client-IP headers when the process genuinely sits
   * behind a proxy that overwrites them. Otherwise any client could spoof one.
   */
  trustProxy: bool(process.env.TRUST_PROXY),

  csrfHeader: 'x-taamen-requested',

  rateLimit: {
    windowMs: MINUTE,
    maxAttempts: 8,
    cooldownMs: 5 * MINUTE,
    maxEntries: 5000,
  },

  contact: {
    /** The browser can never choose the recipient. */
    recipient: process.env.TAAMEN_SUPPORT_RECIPIENT || '',
    emailjsServiceId: process.env.EMAILJS_SERVICE_ID || '',
    emailjsContactTemplateId: process.env.EMAILJS_CONTACT_TEMPLATE_ID || '',
    emailjsAutoReplyTemplateId: process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID || '',
    emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    emailjsPrivateKey: process.env.EMAILJS_PRIVATE_KEY || '',
    maxMessageLength: 2000,
    maxNameLength: 80,
    maxEmailLength: 254,
  },

  maxBodyBytes: 64 * 1024,
};
