import crypto from 'node:crypto';

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export const MIN_PASSWORD_LENGTH = 12;

export function hashPassword(password, salt = crypto.randomBytes(SALT_BYTES).toString('hex')) {
  return { salt, digest: crypto.scryptSync(password, salt, KEY_LENGTH).toString('hex') };
}

/**
 * Constant-time comparison. Returns false for malformed stored hashes rather than
 * throwing, so a damaged record cannot become an authentication bypass or a 500.
 */
export function verifyPassword(password, stored) {
  if (!stored || typeof stored.salt !== 'string' || typeof stored.digest !== 'string') return false;
  try {
    const expected = Buffer.from(stored.digest, 'hex');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = crypto.scryptSync(password, stored.salt, KEY_LENGTH);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
