import { config } from './config.mjs';
import {
  HttpError, clearedSessionCookie, clientIp, isSecureRequest, json, noContent,
  parseCookies, readJsonBody, sessionCookie,
} from './http.mjs';
import { findActiveMemberByCode, findMemberById, store } from './store.mjs';
import { createSession, destroySession, readSession } from './sessions.mjs';
import { createRateLimiter } from './rateLimit.mjs';
import { requiredEmail, requiredString } from './validate.mjs';
import { historicalMatchDto, sessionMemberDto } from './dto.mjs';
import { contactConfigured, sendContactMessage } from './contact.mjs';

const recognitionLimiter = createRateLimiter();
const contactLimiter = createRateLimiter({ maxAttempts: 3, windowMs: 10 * 60_000, cooldownMs: 30 * 60_000 });

/** Deliberately identical for unknown and wrong identifiers, to avoid enumeration. */
const REJECTED_CODE = 'Invalid member ID.';

function sessionToken(req) {
  return parseCookies(req)[config.sessionCookieName] || '';
}

/**
 * Resolve the caller's authorization context from the server-side session record.
 * Request bodies never contribute to this.
 * Only Featured Member recognition (`code`) sessions remain a product surface.
 */
async function currentActor(req) {
  const token = sessionToken(req);
  if (!token) return null;
  const session = await readSession(token);
  if (!session) return null;
  if (session.authMethod !== 'code') {
    await destroySession(token);
    return null;
  }
  const member = await store.read(data => findMemberById(data, session.memberId));
  if (!member || member.active === false) {
    await destroySession(token);
    return null;
  }
  return { token, session, member, role: member.role, authMethod: session.authMethod };
}

function requireActor(actor) {
  if (!actor) throw new HttpError(401, 'Authentication is required.');
  return actor;
}

/** Historical archive is the recognition scope. */
function requireRecognition(actor) {
  requireActor(actor);
  if (actor.authMethod !== 'code') {
    throw new HttpError(403, 'This resource is limited to member recognition sessions.');
  }
  return actor;
}

function issueSession(req, res, { member, authMethod, token, expiresAt }) {
  const secure = config.isProduction || isSecureRequest(req);
  const maxAge = Math.floor(config.sessionTtlMs / 1000);
  return json(req, res, 200, {
    authenticated: true,
    authMethod,
    member: sessionMemberDto(member),
    expiresAt,
  }, { 'Set-Cookie': sessionCookie(token, maxAge, secure) });
}

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (req, res) => json(req, res, 200, { name: 'TAAMEN API', status: 'ok' }),
  },

  {
    method: 'GET',
    path: '/api/health',
    handler: (req, res) => json(req, res, 200, {
      ok: true,
      service: 'taamen-api',
      emailConfigured: contactConfigured(),
    }),
  },

  {
    method: 'POST',
    path: '/api/featured/member',
    handler: async (req, res) => {
      const key = clientIp(req);
      if (!recognitionLimiter.check(key)) {
        throw new HttpError(429, 'Too many attempts. Try again later.');
      }
      const body = await readJsonBody(req);
      const code = requiredString(body, 'memberCode', { max: 60 });
      const member = await store.read(data => findActiveMemberByCode(data, code));
      if (!member) throw new HttpError(401, REJECTED_CODE);
      recognitionLimiter.reset(key);
      const { token, expiresAt } = await createSession({
        memberId: member.id,
        authMethod: 'code',
        role: member.role,
      });
      return issueSession(req, res, { member, authMethod: 'code', token, expiresAt });
    },
  },

  {
    method: 'GET',
    path: '/api/auth/session',
    handler: async (req, res, actor) => {
      if (!actor) return json(req, res, 200, { authenticated: false });
      return json(req, res, 200, {
        authenticated: true,
        authMethod: actor.authMethod,
        member: sessionMemberDto(actor.member),
        expiresAt: actor.session.expiresAt,
      });
    },
  },

  {
    method: 'POST',
    path: '/api/auth/logout',
    handler: async (req, res) => {
      const token = sessionToken(req);
      if (token) await destroySession(token);
      const secure = config.isProduction || isSecureRequest(req);
      return json(req, res, 200, { ok: true }, { 'Set-Cookie': clearedSessionCookie(secure) });
    },
  },

  {
    method: 'GET',
    path: '/api/private/historical',
    handler: async (req, res, actor) => {
      requireRecognition(actor);
      const items = await store.read(data => data.matches.map(historicalMatchDto));
      items.sort((a, b) => b.dateKey - a.dateKey);
      return json(req, res, 200, { items });
    },
  },

  {
    method: 'POST',
    path: '/api/public/contact',
    handler: async (req, res) => {
      const key = clientIp(req);
      if (!contactLimiter.check(key)) {
        throw new HttpError(429, 'Too many messages. Try again later.');
      }
      const body = await readJsonBody(req);
      const email = requiredEmail(body, 'email', { max: config.contact.maxEmailLength });
      const message = requiredString(body, 'message', { min: 3, max: config.contact.maxMessageLength });
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (name.length > config.contact.maxNameLength) {
        throw new HttpError(400, 'name is too long.');
      }
      if (!contactConfigured()) {
        throw new HttpError(503, 'The contact channel is not configured.');
      }
      const result = await sendContactMessage({ email, message, name });
      if (!result.contactSent) throw new HttpError(502, 'The message could not be delivered.');
      return json(req, res, 200, {
        ok: true,
        contactSent: true,
        autoReplySent: result.autoReplySent === true,
      });
    },
  },
];

function matchRoute(pathname) {
  const candidates = [];
  for (const route of routes) {
    if (route.path) {
      if (route.path === pathname) candidates.push({ route, params: [] });
      continue;
    }
    const found = route.pattern.exec(pathname);
    if (found) candidates.push({ route, params: found.slice(1) });
  }
  return candidates;
}

export async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (config.requireHttps && !isSecureRequest(req)) {
    return json(req, res, 426, { error: 'HTTPS is required.' });
  }

  if (req.method === 'OPTIONS') {
    return noContent(req, res, 204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': `Content-Type, ${config.csrfHeader}`,
      'Access-Control-Max-Age': '600',
    });
  }

  const candidates = matchRoute(pathname);
  if (!candidates.length) return json(req, res, 404, { error: 'Not found.' });

  const chosen = candidates.find(candidate => candidate.route.method === req.method);
  if (!chosen) {
    const allowed = [...new Set(candidates.map(candidate => candidate.route.method))].join(', ');
    return json(req, res, 405, { error: 'Method not allowed.' }, { Allow: allowed });
  }

  const mutating = req.method !== 'GET' && req.method !== 'HEAD';
  if (mutating && !req.headers[config.csrfHeader]) {
    return json(req, res, 403, { error: 'Missing required request header.' });
  }

  const actor = await currentActor(req);
  return chosen.route.handler(req, res, actor, chosen.params);
}
