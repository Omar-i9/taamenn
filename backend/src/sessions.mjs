import crypto from 'node:crypto';
import { config } from './config.mjs';
import { createJsonFile } from './jsonFile.mjs';

const AUTH_METHODS = new Set(['code', 'password']);

/**
 * The browser holds the only copy of the raw token. The server stores its SHA-256
 * digest, so a leaked session file cannot be replayed as a set of live cookies.
 */
function digest(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function validateSessions(input) {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const records = raw.records && typeof raw.records === 'object' && !Array.isArray(raw.records) ? raw.records : {};
  const now = Date.now();
  const clean = {};
  for (const [key, value] of Object.entries(records)) {
    if (!/^[a-f0-9]{64}$/.test(key)) continue;
    if (!value || typeof value !== 'object') continue;
    if (typeof value.memberId !== 'string' || !value.memberId) continue;
    if (!AUTH_METHODS.has(value.authMethod)) continue;
    if (typeof value.expiresAt !== 'number' || value.expiresAt <= now) continue;
    clean[key] = {
      memberId: value.memberId,
      authMethod: value.authMethod,
      role: value.role === 'OWNER' ? 'OWNER' : 'MEMBER',
      expiresAt: value.expiresAt,
      createdAt: typeof value.createdAt === 'number' ? value.createdAt : now,
    };
  }
  return { records: clean };
}

const file = createJsonFile({
  file: config.sessionFile,
  validate: validateSessions,
  createFallback: async () => ({ records: {} }),
});

function sweep(state) {
  const now = Date.now();
  let removed = 0;
  for (const [key, value] of Object.entries(state.records)) {
    if (value.expiresAt <= now) {
      delete state.records[key];
      removed += 1;
    }
  }
  return removed;
}

/**
 * Create a session. The authorization context is decided here, on the server,
 * from the verified member record — never from request input.
 */
export async function createSession({ memberId, authMethod, role }) {
  if (!AUTH_METHODS.has(authMethod)) throw new Error(`unsupported authMethod: ${authMethod}`);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + config.sessionTtlMs;
  await file.update(state => {
    sweep(state);
    state.records[digest(token)] = {
      memberId,
      authMethod,
      role: role === 'OWNER' ? 'OWNER' : 'MEMBER',
      expiresAt,
      createdAt: Date.now(),
    };
  });
  return { token, expiresAt };
}

/** Returns the server-side authorization context, or null when absent/expired. */
export async function readSession(token) {
  if (!token || typeof token !== 'string') return null;
  const key = digest(token);
  return file.update(state => {
    sweep(state);
    const record = state.records[key];
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      delete state.records[key];
      return null;
    }
    return { ...record };
  });
}

export async function destroySession(token) {
  if (!token || typeof token !== 'string') return;
  const key = digest(token);
  await file.update(state => {
    sweep(state);
    delete state.records[key];
  });
}

/** Used by password reset and deactivation. */
export async function destroyMemberSessions(memberId, { authMethod } = {}) {
  await file.update(state => {
    for (const [key, record] of Object.entries(state.records)) {
      if (record.memberId !== memberId) continue;
      if (authMethod && record.authMethod !== authMethod) continue;
      delete state.records[key];
    }
  });
}

export async function sessionCount() {
  return file.update(state => {
    sweep(state);
    return Object.keys(state.records).length;
  });
}
