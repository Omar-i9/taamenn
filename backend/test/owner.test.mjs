import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEMBER_PASSWORD, OWNER_PASSWORD, cookieFrom, prepareEnvironment,
  seedDataset, startTestServer, writeDataset,
} from './helpers.mjs';

prepareEnvironment('owner');

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

async function login(name, password) {
  const response = await api.post('/api/auth/login', { body: { name, password } });
  assert.equal(response.status, 200, `${name} should be able to sign in`);
  return cookieFrom(response);
}

test('an OWNER can reset a member password, which revokes that member\'s sessions', async () => {
  const memberCookie = await login('test-member', MEMBER_PASSWORD);
  assert.equal((await api.get('/api/private/circle/matches', { cookie: memberCookie })).status, 200);

  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  const newPassword = 'replacement-password-99';
  const reset = await api.post('/api/owner/members/member-regular/reset-password', {
    cookie: ownerCookie,
    body: { newPassword },
  });
  assert.equal(reset.status, 200);

  // The member's existing session must not survive a credential change.
  assert.equal((await api.get('/api/private/circle/matches', { cookie: memberCookie })).status, 401);
  // The owner's own session is unaffected.
  assert.equal((await api.get('/api/owner/overview', { cookie: ownerCookie })).status, 200);

  assert.equal((await api.post('/api/auth/login', { body: { name: 'test-member', password: MEMBER_PASSWORD } })).status, 401);
  assert.equal((await api.post('/api/auth/login', { body: { name: 'test-member', password: newPassword } })).status, 200);
});

test('a password reset below the minimum length is refused', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  const response = await api.post('/api/owner/members/member-regular/reset-password', {
    cookie: ownerCookie,
    body: { newPassword: 'short' },
  });
  assert.equal(response.status, 400);
});

test('owner actions against an unknown member return 404 without side effects', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  const reset = await api.post('/api/owner/members/does-not-exist/reset-password', {
    cookie: ownerCookie,
    body: { newPassword: 'replacement-password-99' },
  });
  assert.equal(reset.status, 404);

  const status = await api.post('/api/owner/members/does-not-exist/status', {
    cookie: ownerCookie,
    body: { active: false },
  });
  assert.equal(status.status, 404);
});

test('deactivating a member revokes both recognition and password sessions', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  await api.post('/api/owner/members/member-regular/reset-password', {
    cookie: ownerCookie,
    body: { newPassword: 'known-password-12345' },
  });

  const passwordCookie = await login('test-member', 'known-password-12345');
  const recognition = await api.post('/api/featured/member', { body: { memberCode: 'user#MEMBER1' } });
  const codeCookie = cookieFrom(recognition);
  assert.equal((await api.get('/api/private/historical', { cookie: codeCookie })).status, 200);

  const deactivate = await api.post('/api/owner/members/member-regular/status', {
    cookie: ownerCookie,
    body: { active: false },
  });
  assert.equal(deactivate.status, 200);
  assert.equal(deactivate.body.member.active, false);

  assert.equal((await api.get('/api/private/circle/matches', { cookie: passwordCookie })).status, 401);
  assert.equal((await api.get('/api/private/historical', { cookie: codeCookie })).status, 401);
  assert.equal((await api.post('/api/featured/member', { body: { memberCode: 'user#MEMBER1' } })).status, 401);

  // Reactivation restores access.
  const reactivate = await api.post('/api/owner/members/member-regular/status', {
    cookie: ownerCookie,
    body: { active: true },
  });
  assert.equal(reactivate.status, 200);
  assert.equal((await api.post('/api/featured/member', { body: { memberCode: 'user#MEMBER1' } })).status, 200);
});

test('an owner cannot deactivate their own account', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  const response = await api.post('/api/owner/members/member-owner/status', {
    cookie: ownerCookie,
    body: { active: false },
  });
  assert.equal(response.status, 400);
  assert.equal((await api.get('/api/owner/overview', { cookie: ownerCookie })).status, 200);
});

test('member status requires a real boolean rather than a truthy value', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  for (const active of ['false', 0, null, 'yes']) {
    const response = await api.post('/api/owner/members/member-regular/status', {
      cookie: ownerCookie,
      body: { active },
    });
    assert.equal(response.status, 400, `active=${JSON.stringify(active)} must be refused`);
  }
});

test('a member cannot act on another member by changing the path', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  await api.post('/api/owner/members/member-regular/reset-password', {
    cookie: ownerCookie,
    body: { newPassword: 'restored-password-123' },
  });
  const memberCookie = await login('test-member', 'restored-password-123');

  for (const target of ['member-owner', 'member-regular', 'member-inactive']) {
    const reset = await api.post(`/api/owner/members/${target}/reset-password`, {
      cookie: memberCookie,
      body: { newPassword: 'attacker-password-123' },
    });
    assert.equal(reset.status, 403, `a member must not reset ${target}`);
  }

  // The owner password must still work, proving nothing was changed.
  assert.equal((await api.post('/api/auth/login', { body: { name: 'test-owner', password: OWNER_PASSWORD } })).status, 200);
});

test('the audit trail records owner actions and never stores secrets', async () => {
  const ownerCookie = await login('test-owner', OWNER_PASSWORD);
  await api.post('/api/owner/members/member-regular/status', { cookie: ownerCookie, body: { active: true } });
  const overview = await api.get('/api/owner/overview', { cookie: ownerCookie });
  const actions = overview.body.latestActivity.map(entry => entry.action);
  assert.ok(actions.includes('MEMBER_ACTIVATED') || actions.includes('MEMBER_DEACTIVATED'));
  const serialized = JSON.stringify(overview.body.latestActivity);
  assert.ok(!serialized.includes('password'), 'the audit trail must not contain credentials');
});
