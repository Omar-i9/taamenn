import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEMBER_PASSWORD, OWNER_PASSWORD, cookieFrom, prepareEnvironment,
  seedDataset, startTestServer, writeDataset,
} from './helpers.mjs';

prepareEnvironment('auth');

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

async function recognitionSession(code = 'user#MEMBER1') {
  const response = await api.post('/api/featured/member', { body: { memberCode: code } });
  assert.equal(response.status, 200, 'recognition should succeed');
  return cookieFrom(response);
}

async function passwordSession(name, password) {
  const response = await api.post('/api/auth/login', { body: { name, password } });
  assert.equal(response.status, 200, `login should succeed for ${name}`);
  return cookieFrom(response);
}

test('anonymous callers cannot read private historical data', async () => {
  const response = await api.get('/api/private/historical');
  assert.equal(response.status, 401);
  assert.equal(response.body.items, undefined);
});

test('anonymous callers cannot read any Circle or Owner resource', async () => {
  for (const route of [
    '/api/private/circle/matches',
    '/api/private/circle/players',
    '/api/private/circle/statistics',
    '/api/private/circle/notifications',
    '/api/private/circle/tactical',
    '/api/owner/overview',
  ]) {
    const response = await api.get(route);
    assert.equal(response.status, 401, `${route} must reject anonymous callers`);
  }
});

test('an unknown recognition code is rejected without revealing whether it exists', async () => {
  const response = await api.post('/api/featured/member', { body: { memberCode: 'user#NOPE' } });
  assert.equal(response.status, 401);
  assert.match(response.body.error, /not recognized/i);
  assert.equal(cookieFrom(response), '', 'no session cookie may be issued');
});

test('a deactivated member cannot be recognized', async () => {
  const response = await api.post('/api/featured/member', { body: { memberCode: 'user#GONE1' } });
  assert.equal(response.status, 401);
});

test('a valid recognition code creates a session and never returns the code', async () => {
  const response = await api.post('/api/featured/member', { body: { memberCode: 'user#MEMBER1' } });
  assert.equal(response.status, 200);
  assert.equal(response.body.authMethod, 'code');
  assert.equal(response.body.member.displayName, 'Test Member');

  const serialized = JSON.stringify(response.body);
  assert.ok(!serialized.includes('user#MEMBER1'), 'the recognition code must not be echoed');
  assert.ok(!serialized.includes('passwordHash'), 'credential material must not be returned');
  assert.equal(response.body.member.username, undefined, 'the username is not part of the session DTO');

  const cookie = response.setCookie.find(value => value.startsWith('taamen_session='));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
});

test('a recognition session can read historical data but nothing from the Circle', async () => {
  const cookie = await recognitionSession();

  const historical = await api.get('/api/private/historical', { cookie });
  assert.equal(historical.status, 200);
  assert.equal(historical.body.items.length, 2);
  // The historical DTO must not carry Circle-only fields.
  assert.equal(historical.body.items[0].details, undefined);
  assert.equal(historical.body.items[0].visibility, undefined);

  for (const route of [
    '/api/private/circle/matches',
    '/api/private/circle/players',
    '/api/private/circle/statistics',
    '/api/private/circle/notifications',
    '/api/private/circle/tactical',
    '/api/owner/overview',
  ]) {
    const response = await api.get(route, { cookie });
    assert.equal(response.status, 403, `${route} must reject a recognition session`);
  }

  const write = await api.post('/api/private/circle/tactical', {
    cookie,
    body: { plan: { formationId: 'diamond', players: [] } },
  });
  assert.equal(write.status, 403, 'a recognition session must not write tactical plans');
});

test('a recognition session cannot escalate by sending role or identity fields', async () => {
  const cookie = await recognitionSession();
  const escalation = await api.post('/api/featured/member', {
    cookie,
    body: { memberCode: 'user#MEMBER1', role: 'OWNER', authMethod: 'password', isOwner: true, memberId: 'member-owner' },
  });
  assert.equal(escalation.status, 200);
  assert.equal(escalation.body.authMethod, 'code', 'authMethod is decided by the server');
  assert.equal(escalation.body.member.role, 'MEMBER', 'the role comes from the member record');

  const forged = cookieFrom(escalation);
  const owner = await api.get('/api/owner/overview', { cookie: forged });
  assert.equal(owner.status, 403);
});

test('login rejects a wrong password and an unknown name identically', async () => {
  const wrongPassword = await api.post('/api/auth/login', { body: { name: 'test-member', password: 'not-the-password' } });
  const unknownName = await api.post('/api/auth/login', { body: { name: 'nobody-at-all', password: MEMBER_PASSWORD } });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownName.status, 401);
  assert.equal(wrongPassword.body.error, unknownName.body.error, 'responses must not enable enumeration');
});

test('a deactivated member cannot sign in with a valid password', async () => {
  const response = await api.post('/api/auth/login', { body: { name: 'test-inactive', password: MEMBER_PASSWORD } });
  assert.equal(response.status, 401);
});

test('a password MEMBER session reaches the Circle but not Owner routes', async () => {
  const cookie = await passwordSession('test-member', MEMBER_PASSWORD);

  const matches = await api.get('/api/private/circle/matches', { cookie });
  assert.equal(matches.status, 200);
  assert.equal(matches.body.items.length, 2);
  assert.equal(matches.body.items[0].visibility, 'PRIVATE');

  for (const route of ['/api/private/circle/players', '/api/private/circle/statistics', '/api/private/circle/notifications']) {
    assert.equal((await api.get(route, { cookie })).status, 200, `${route} must be readable`);
  }

  assert.equal((await api.get('/api/owner/overview', { cookie })).status, 403);
  assert.equal((await api.post('/api/owner/members/member-regular/status', { cookie, body: { active: false } })).status, 403);
  assert.equal((await api.post('/api/owner/members/member-regular/reset-password', { cookie, body: { newPassword: 'a-new-password-12' } })).status, 403);
});

test('historical data stays a recognition resource and is refused to password sessions', async () => {
  const cookie = await passwordSession('test-member', MEMBER_PASSWORD);
  const response = await api.get('/api/private/historical', { cookie });
  assert.equal(response.status, 403);
  assert.match(response.body.error, /recognition/i);
});

test('Circle notifications are scoped to the caller', async () => {
  const memberCookie = await passwordSession('test-member', MEMBER_PASSWORD);
  const memberNotices = await api.get('/api/private/circle/notifications', { cookie: memberCookie });
  const memberIds = memberNotices.body.items.map(item => item.id);
  assert.ok(memberIds.includes('n-shared'));
  assert.ok(memberIds.includes('n-member'));
  assert.ok(!memberIds.includes('n-owner'), 'a member must not read another member\'s notice');

  const ownerCookie = await passwordSession('test-owner', OWNER_PASSWORD);
  const ownerNotices = await api.get('/api/private/circle/notifications', { cookie: ownerCookie });
  const ownerIds = ownerNotices.body.items.map(item => item.id);
  assert.ok(ownerIds.includes('n-owner'));
  assert.ok(!ownerIds.includes('n-member'), 'even an owner reads this endpoint as themselves');
});

test('an OWNER session can read the owner overview without exposing credentials', async () => {
  const cookie = await passwordSession('test-owner', OWNER_PASSWORD);
  const response = await api.get('/api/owner/overview', { cookie });
  assert.equal(response.status, 200);
  assert.equal(response.body.activeMembers, 2);
  const serialized = JSON.stringify(response.body);
  assert.ok(!serialized.includes('passwordHash'));
  assert.ok(!serialized.includes('user#'), 'recognition codes must not appear in the owner view');
  assert.ok(!/\b[0-9a-f]{128}\b/.test(serialized), 'no password digest may appear');
});

test('password login replaces a recognition session on the same cookie', async () => {
  const codeCookie = await recognitionSession('user#MEMBER1');
  assert.equal((await api.get('/api/private/historical', { cookie: codeCookie })).status, 200);

  const login = await api.post('/api/auth/login', {
    cookie: codeCookie,
    body: { name: 'test-member', password: MEMBER_PASSWORD },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.authMethod, 'password');

  const replaced = await api.get('/api/auth/session', { cookie: codeCookie });
  assert.equal(replaced.status, 401, 'the previous token must no longer be valid');

  const newCookie = cookieFrom(login);
  const session = await api.get('/api/auth/session', { cookie: newCookie });
  assert.equal(session.body.authMethod, 'password');
});

test('logout invalidates the server session and clears the cookie', async () => {
  const cookie = await passwordSession('test-member', MEMBER_PASSWORD);
  assert.equal((await api.get('/api/auth/session', { cookie })).status, 200);

  const logout = await api.post('/api/auth/logout', { cookie });
  assert.equal(logout.status, 200);
  assert.match(logout.setCookie[0], /taamen_session=;/);
  assert.match(logout.setCookie[0], /Max-Age=0/);
  assert.match(logout.setCookie[0], /HttpOnly/);

  assert.equal((await api.get('/api/auth/session', { cookie })).status, 401);
  assert.equal((await api.get('/api/private/circle/matches', { cookie })).status, 401);
});

test('a forged or unknown session token is rejected', async () => {
  const forged = `taamen_session=${'a'.repeat(64)}`;
  assert.equal((await api.get('/api/auth/session', { cookie: forged })).status, 401);
  assert.equal((await api.get('/api/private/historical', { cookie: forged })).status, 401);
  assert.equal((await api.get('/api/private/circle/matches', { cookie: 'taamen_session=not-a-token' })).status, 401);
});

test('mutating requests without the CSRF header are refused', async () => {
  const cookie = await passwordSession('test-member', MEMBER_PASSWORD);
  const response = await api.post('/api/private/circle/tactical', {
    cookie,
    csrf: false,
    body: { plan: { formationId: 'diamond', players: [] } },
  });
  assert.equal(response.status, 403);
  assert.match(response.body.error, /header/i);

  const login = await api.post('/api/auth/login', {
    csrf: false,
    body: { name: 'test-member', password: MEMBER_PASSWORD },
  });
  assert.equal(login.status, 403, 'login is also protected against cross-site submission');
});

test('wrong HTTP methods are refused with an Allow header', async () => {
  const response = await api.get('/api/auth/logout');
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');

  const tactical = await api.call('DELETE', '/api/private/circle/tactical');
  assert.equal(tactical.status, 405);
});

test('security headers are present and API responses are not cacheable', async () => {
  const response = await api.get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('CORS credentials are granted only to allow-listed origins', async () => {
  const allowed = await api.get('/api/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');

  const foreign = await api.get('/api/health', { headers: { Origin: 'https://attacker.example' } });
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
});

test('oversized and malformed request bodies are rejected', async () => {
  const oversized = await fetch(`${api.base}/api/featured/member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-TAAMEN-Requested': '1' },
    body: JSON.stringify({ memberCode: 'x'.repeat(200_000) }),
  });
  assert.equal(oversized.status, 413);

  const malformed = await fetch(`${api.base}/api/featured/member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-TAAMEN-Requested': '1' },
    body: '{not json',
  });
  assert.equal(malformed.status, 400);

  const arrayBody = await api.post('/api/featured/member', { body: ['user#MEMBER1'] });
  assert.equal(arrayBody.status, 400);
});

test('unknown routes do not leak internals', async () => {
  const response = await api.get('/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.deepEqual(Object.keys(response.body), ['error']);
  assert.ok(!/[/\\]/.test(response.body.error), 'no filesystem path may appear in the error');
});
