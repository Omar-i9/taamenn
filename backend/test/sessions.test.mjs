import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { prepareEnvironment, seedDataset, writeDataset } from './helpers.mjs';

prepareEnvironment('sessions');
// A short lifetime lets expiry be observed without waiting.
process.env.SESSION_TTL_MS = '900000';

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { initNodeRuntime, resetNodeRuntime } = await import('../src/nodePersistence.mjs');
initNodeRuntime();

const { createSession, destroyMemberSessions, destroySession, readSession, sessionCount } = await import('../src/sessions.mjs');

test('a session token is never stored in plain text', async () => {
  const { token } = await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  const stored = fs.readFileSync(process.env.TAAMEN_SESSION_FILE, 'utf8');
  assert.ok(!stored.includes(token), 'the raw token must not reach disk');
  assert.ok(stored.includes(crypto.createHash('sha256').update(token).digest('hex')), 'the digest is the lookup key');
});

test('a session is readable by its token and carries a server-decided context', async () => {
  const { token, expiresAt } = await createSession({ memberId: 'member-owner', authMethod: 'password', role: 'OWNER' });
  const session = await readSession(token);
  assert.equal(session.memberId, 'member-owner');
  assert.equal(session.authMethod, 'password');
  assert.equal(session.role, 'OWNER');
  assert.equal(session.expiresAt, expiresAt);
  assert.ok(expiresAt > Date.now());
});

test('an unknown, empty, or malformed token resolves to no session', async () => {
  for (const token of ['', null, undefined, 'nonsense', 'a'.repeat(64), 12345]) {
    assert.equal(await readSession(token), null, `${String(token)} must not resolve`);
  }
});

test('an unsupported authMethod cannot be stored', async () => {
  await assert.rejects(
    createSession({ memberId: 'member-regular', authMethod: 'magic-link', role: 'MEMBER' }),
    /unsupported authMethod/,
  );
});

test('an unknown role is stored as MEMBER rather than trusted', async () => {
  const { token } = await createSession({ memberId: 'member-regular', authMethod: 'password', role: 'SUPERUSER' });
  const session = await readSession(token);
  assert.equal(session.role, 'MEMBER');
});

test('destroying a session removes only that session', async () => {
  const first = await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  const second = await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  await destroySession(first.token);
  assert.equal(await readSession(first.token), null);
  assert.ok(await readSession(second.token), 'unrelated sessions survive');
});

test('member-wide revocation can target one authMethod or all of them', async () => {
  const code = await createSession({ memberId: 'member-owner', authMethod: 'code', role: 'OWNER' });
  const password = await createSession({ memberId: 'member-owner', authMethod: 'password', role: 'OWNER' });
  const other = await createSession({ memberId: 'member-regular', authMethod: 'password', role: 'MEMBER' });

  await destroyMemberSessions('member-owner', { authMethod: 'password' });
  assert.equal(await readSession(password.token), null, 'password sessions are revoked');
  assert.ok(await readSession(code.token), 'the recognition session is untouched');
  assert.ok(await readSession(other.token), 'another member is untouched');

  await destroyMemberSessions('member-owner');
  assert.equal(await readSession(code.token), null);
  assert.ok(await readSession(other.token));
});

test('expired sessions are rejected and swept from the store', async () => {
  const { token } = await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  const digest = crypto.createHash('sha256').update(token).digest('hex');

  // Backdate the record on disk, then force a reload to prove expiry is enforced
  // by the server rather than by the client holding the cookie.
  const stored = JSON.parse(fs.readFileSync(process.env.TAAMEN_SESSION_FILE, 'utf8'));
  stored.records[digest].expiresAt = Date.now() - 1000;
  fs.writeFileSync(process.env.TAAMEN_SESSION_FILE, JSON.stringify(stored), 'utf8');

  resetNodeRuntime();
  assert.equal(await readSession(token), null, 'an expired session must not authenticate');

  const afterSweep = JSON.parse(fs.readFileSync(process.env.TAAMEN_SESSION_FILE, 'utf8'));
  assert.equal(afterSweep.records[digest], undefined, 'the expired record is swept');
});

test('records with a tampered shape are discarded when the store is loaded', async () => {
  const valid = await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  const stored = JSON.parse(fs.readFileSync(process.env.TAAMEN_SESSION_FILE, 'utf8'));
  stored.records['not-a-digest'] = { memberId: 'member-owner', authMethod: 'password', role: 'OWNER', expiresAt: Date.now() + 60_000 };
  stored.records['b'.repeat(64)] = { memberId: 'member-owner', authMethod: 'invented', role: 'OWNER', expiresAt: Date.now() + 60_000 };
  stored.records['c'.repeat(64)] = { authMethod: 'password', role: 'OWNER', expiresAt: Date.now() + 60_000 };
  fs.writeFileSync(process.env.TAAMEN_SESSION_FILE, JSON.stringify(stored), 'utf8');

  resetNodeRuntime();
  assert.ok(await readSession(valid.token), 'the legitimate session still resolves');

  const reloaded = JSON.parse(fs.readFileSync(process.env.TAAMEN_SESSION_FILE, 'utf8'));
  for (const key of ['not-a-digest', 'b'.repeat(64), 'c'.repeat(64)]) {
    assert.equal(reloaded.records[key], undefined, `the tampered record ${key} must be discarded`);
  }
});

test('sessions survive a restart of the session module', async () => {
  const { token } = await createSession({ memberId: 'member-regular', authMethod: 'password', role: 'MEMBER' });
  resetNodeRuntime();
  const session = await readSession(token);
  assert.ok(session, 'a restart must not silently drop authentication');
  assert.equal(session.authMethod, 'password');
});

test('the session count reflects live sessions only', async () => {
  const { destroyMemberSessions: revoke } = await import('../src/sessions.mjs');
  await revoke('member-regular');
  await revoke('member-owner');
  assert.equal(await sessionCount(), 0);
  await createSession({ memberId: 'member-regular', authMethod: 'code', role: 'MEMBER' });
  assert.equal(await sessionCount(), 1);
});
