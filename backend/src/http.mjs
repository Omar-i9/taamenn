import { config } from './config.mjs';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function originHeaders(req) {
  const origin = req.headers.origin;
  if (!origin) return {};
  if (!config.allowedOrigins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
}

export function json(req, res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_HEADERS,
    ...originHeaders(req),
    ...headers,
  });
  res.end(JSON.stringify(body));
}

export function noContent(req, res, status, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...originHeaders(req), ...headers });
  res.end();
}

export function parseCookies(req) {
  const raw = req.headers.cookie || '';
  const out = {};
  for (const part of raw.split(';')) {
    if (!part) continue;
    const index = part.indexOf('=');
    if (index < 1) continue;
    const name = part.slice(0, index).trim();
    if (!name) continue;
    out[name] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}

/** Cookie attributes follow the deployment, not a guess: Secure only where the transport is secure. */
export function sessionCookie(token, maxAgeSeconds, secure) {
  const attributes = [
    `${config.sessionCookieName}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearedSessionCookie(secure) {
  return sessionCookie('', 0, secure);
}

export function isSecureRequest(req) {
  if (req.socket.encrypted) return true;
  if (!config.trustProxy) return false;
  return String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

export class HttpError extends Error {
  constructor(status, message, { unreadBody = false } = {}) {
    super(message);
    this.status = status;
    /** True when the request body was abandoned part-way and still needs draining. */
    this.unreadBody = unreadBody;
  }
}

/**
 * Discard the rest of an abandoned request body without buffering it.
 *
 * Closing the socket immediately makes a client that is still uploading see a
 * connection reset instead of the 413 response, so the remainder is drained. The
 * drain is capped in bytes and time so this cannot be used to hold resources open.
 */
export function drainRequest(req, { maxBytes = 4 * 1024 * 1024, timeoutMs = 2000 } = {}) {
  if (req.readableEnded || req.destroyed) return;
  let drained = 0;
  const timer = setTimeout(() => req.destroy(), timeoutMs);
  timer.unref?.();
  req.on('data', chunk => {
    drained += chunk.length;
    if (drained > maxBytes) req.destroy();
  });
  req.on('end', () => clearTimeout(timer));
  req.on('error', () => clearTimeout(timer));
  req.resume();
}

/** Enforce the limit while streaming so an oversized body is never fully buffered. */
export async function readJsonBody(req) {
  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > config.maxBodyBytes) {
    throw new HttpError(413, 'Request body is too large.', { unreadBody: true });
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > config.maxBodyBytes) {
      throw new HttpError(413, 'Request body is too large.', { unreadBody: true });
    }
    chunks.push(chunk);
  }
  if (!size) return {};
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'Request body must be a JSON object.');
  }
  return parsed;
}

export function clientIp(req) {
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
  }
  return req.socket.remoteAddress || 'unknown';
}
