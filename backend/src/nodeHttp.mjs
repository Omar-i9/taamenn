import { config } from './config.mjs';
import { HttpError } from './http.mjs';

const SKIP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-connection',
  'transfer-encoding',
  'upgrade',
  'http2-settings',
]);

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

export function nodeClientIp(req) {
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
  }
  return req.socket.remoteAddress || 'unknown';
}

export function nodeEncrypted(req) {
  if (req.socket.encrypted) return true;
  if (!config.trustProxy) return false;
  return String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

/** Convert a Node IncomingMessage into a Web Fetch Request for the shared API. */
export async function nodeToFetchRequest(req) {
  const host = req.headers.host || 'localhost';
  const url = `http://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || SKIP_HEADERS.has(key)) continue;
    try {
      headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
    } catch {
      /* skip forbidden or invalid header names */
    }
  }

  const method = req.method || 'GET';
  const needBody = method !== 'GET' && method !== 'HEAD';
  if (!needBody) return new Request(url, { method, headers });

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

  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  return new Request(url, { method, headers, body });
}

export async function sendNodeResponse(res, response) {
  const headers = {};
  const cookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : [];

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    headers[key] = value;
  });
  if (cookies.length === 1) headers['Set-Cookie'] = cookies[0];
  else if (cookies.length > 1) headers['Set-Cookie'] = cookies;

  res.writeHead(response.status, headers);
  const buf = Buffer.from(await response.arrayBuffer());
  res.end(buf);
}
