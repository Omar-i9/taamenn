import { config } from './config.mjs';
import {
  HttpError, clearedSessionCookie, clientIp, isSecureRequest, json, noContent,
  parseCookies, readJsonBody, sessionCookie,
} from './http.mjs';
import { appendAudit, findActiveMemberByCode, findActiveMemberByName, findMemberById, store } from './store.mjs';
import { createSession, destroyMemberSessions, destroySession, readSession } from './sessions.mjs';
import { MIN_PASSWORD_LENGTH, hashPassword, verifyPassword } from './passwords.mjs';
import { createRateLimiter } from './rateLimit.mjs';
import { requiredBoolean, requiredEmail, requiredSecret, requiredString, tacticalPlan } from './validate.mjs';
import {
  adminMemberDto, circleMatchDto, circlePlayerDto, historicalMatchDto,
  notificationDto, sessionMemberDto, statisticsFor,
} from './dto.mjs';
import { contactConfigured, sendContactMessage } from './contact.mjs';

const loginLimiter = createRateLimiter();
const recognitionLimiter = createRateLimiter();
const contactLimiter = createRateLimiter({ maxAttempts: 3, windowMs: 10 * 60_000, cooldownMs: 30 * 60_000 });

/** Deliberately identical for unknown and wrong credentials, to avoid enumeration. */
const REJECTED_LOGIN = 'Private Circle access was not accepted.';
const REJECTED_CODE = 'That member identifier was not recognized.';

function sessionToken(req) {
  return parseCookies(req)[config.sessionCookieName] || '';
}

/**
 * Resolve the caller's authorization context from the server-side session record.
 * Request bodies never contribute to this.
 */
async function currentActor(req) {
  const token = sessionToken(req);
  if (!token) return null;
  const session = await readSession(token);
  if (!session) return null;
  const member = await store.read(data => findMemberById(data, session.memberId));
  if (!member || member.active === false) {
    await destroySession(token);
    return null;
  }
  // Role is re-read from the member record so a stale session cannot retain a revoked role.
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

/** Private Circle requires real authentication, not recognition. */
function requireCircle(actor) {
  requireActor(actor);
  if (actor.authMethod !== 'password') {
    throw new HttpError(403, 'Private Circle access requires password authentication.');
  }
  return actor;
}

function requireOwner(actor) {
  requireCircle(actor);
  if (actor.role !== 'OWNER') throw new HttpError(403, 'Owner role is required.');
  return actor;
}

function issueSession(req, res, { member, authMethod, token, expiresAt }) {
  const secure = config.isProduction || isSecureRequest(req);
  const maxAge = Math.floor(config.sessionTtlMs / 1000);
  return json(req, res, 200, {
    authMethod,
    member: sessionMemberDto(member),
    expiresAt,
  }, { 'Set-Cookie': sessionCookie(token, maxAge, secure) });
}

const routes = [
  {
    method: 'GET',
    path: '/api/health',
    handler: (req, res) => json(req, res, 200, { ok: true, service: 'taamen-backend' }),
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
    method: 'POST',
    path: '/api/auth/login',
    handler: async (req, res) => {
      const key = clientIp(req);
      if (!loginLimiter.check(key)) {
        throw new HttpError(429, 'Too many attempts. Try again later.');
      }
      const body = await readJsonBody(req);
      const name = requiredString(body, 'name', { max: 120 });
      const password = requiredSecret(body, 'password');
      const member = await store.read(data => findActiveMemberByName(data, name));
      if (!member || !member.passwordHash || !verifyPassword(password, member.passwordHash)) {
        throw new HttpError(401, REJECTED_LOGIN);
      }
      loginLimiter.reset(key);
      // Authenticating as an identity replaces any previous session on this cookie.
      const previous = sessionToken(req);
      if (previous) await destroySession(previous);
      const { token, expiresAt } = await createSession({
        memberId: member.id,
        authMethod: 'password',
        role: member.role,
      });
      return issueSession(req, res, { member, authMethod: 'password', token, expiresAt });
    },
  },

  {
    method: 'GET',
    path: '/api/auth/session',
    handler: async (req, res, actor) => {
      requireActor(actor);
      return json(req, res, 200, {
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
    method: 'GET',
    path: '/api/private/circle/matches',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      const items = await store.read(data =>
        data.matches.filter(match => match.visibility === 'PRIVATE').map(circleMatchDto)
      );
      items.sort((a, b) => b.dateKey - a.dateKey);
      return json(req, res, 200, { items });
    },
  },

  {
    method: 'GET',
    path: '/api/private/circle/players',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      const items = await store.read(data => data.players.map(circlePlayerDto));
      return json(req, res, 200, { items });
    },
  },

  {
    method: 'GET',
    path: '/api/private/circle/statistics',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      const items = await store.read(statisticsFor);
      return json(req, res, 200, { items });
    },
  },

  {
    method: 'GET',
    path: '/api/private/circle/notifications',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      // Scoped to the caller: shared circle notices plus the member's own.
      const items = await store.read(data =>
        data.notifications
          .filter(item => !item.memberId || item.memberId === actor.member.id)
          .map(notificationDto)
      );
      items.sort((a, b) => b.createdAt - a.createdAt);
      return json(req, res, 200, { items });
    },
  },

  {
    method: 'GET',
    path: '/api/private/circle/tactical',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      const plan = await store.read(data => data.tacticalPlan);
      return json(req, res, 200, { plan });
    },
  },

  {
    method: 'POST',
    path: '/api/private/circle/tactical',
    handler: async (req, res, actor) => {
      requireCircle(actor);
      const body = await readJsonBody(req);
      const plan = tacticalPlan(body);
      await store.update(data => {
        data.tacticalPlan = { ...plan, updatedAt: Date.now(), updatedBy: actor.member.id };
        appendAudit(data, { actor: actor.member.id, action: 'TACTICAL_UPDATED', entity: 'tactical-plan' });
      });
      return json(req, res, 200, { ok: true });
    },
  },

  {
    method: 'GET',
    path: '/api/owner/overview',
    handler: async (req, res, actor) => {
      requireOwner(actor);
      const overview = await store.read(data => ({
        activeMembers: data.members.filter(member => member.active).length,
        players: data.players.length,
        archivedMatches: data.matches.length,
        unreadNotifications: data.notifications.filter(item => !item.read).length,
        latestActivity: data.audit.slice(-10).reverse(),
        members: data.members.map(adminMemberDto),
      }));
      return json(req, res, 200, overview);
    },
  },

  {
    method: 'POST',
    pattern: /^\/api\/owner\/members\/([^/]+)\/reset-password$/,
    handler: async (req, res, actor, [memberId]) => {
      requireOwner(actor);
      const body = await readJsonBody(req);
      const password = requiredSecret(body, 'newPassword', { min: MIN_PASSWORD_LENGTH });
      const targetId = decodeURIComponent(memberId);
      const updated = await store.update(data => {
        const target = findMemberById(data, targetId);
        if (!target) return null;
        target.passwordHash = hashPassword(password);
        target.updatedAt = Date.now();
        appendAudit(data, { actor: actor.member.id, action: 'MEMBER_PASSWORD_RESET', entity: target.id });
        return adminMemberDto(target);
      });
      if (!updated) throw new HttpError(404, 'Member not found.');
      // A credential change must not leave old authenticated sessions alive.
      await destroyMemberSessions(targetId, { authMethod: 'password' });
      return json(req, res, 200, { ok: true, member: updated });
    },
  },

  {
    method: 'POST',
    pattern: /^\/api\/owner\/members\/([^/]+)\/status$/,
    handler: async (req, res, actor, [memberId]) => {
      requireOwner(actor);
      const body = await readJsonBody(req);
      const active = requiredBoolean(body, 'active');
      const targetId = decodeURIComponent(memberId);
      if (targetId === actor.member.id && !active) {
        throw new HttpError(400, 'The owner cannot deactivate their own account.');
      }
      const updated = await store.update(data => {
        const target = findMemberById(data, targetId);
        if (!target) return null;
        target.active = active;
        target.updatedAt = Date.now();
        appendAudit(data, {
          actor: actor.member.id,
          action: active ? 'MEMBER_ACTIVATED' : 'MEMBER_DEACTIVATED',
          entity: target.id,
        });
        return adminMemberDto(target);
      });
      if (!updated) throw new HttpError(404, 'Member not found.');
      // Deactivation revokes recognition and authenticated sessions alike.
      if (!active) await destroyMemberSessions(targetId);
      return json(req, res, 200, { ok: true, member: updated });
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
      const name = typeof body.name === 'string' ? body.name.trim().slice(0, config.contact.maxNameLength) : '';
      if (!contactConfigured()) {
        throw new HttpError(503, 'The contact channel is not configured.');
      }
      const delivered = await sendContactMessage({ email, message, name });
      if (!delivered) throw new HttpError(502, 'The message could not be delivered.');
      return json(req, res, 200, { ok: true });
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

  // CSRF: state-changing requests must carry a header a cross-site form cannot set.
  const mutating = req.method !== 'GET' && req.method !== 'HEAD';
  if (mutating && !req.headers[config.csrfHeader]) {
    return json(req, res, 403, { error: 'Missing required request header.' });
  }

  const actor = await currentActor(req);
  return chosen.route.handler(req, res, actor, chosen.params);
}
