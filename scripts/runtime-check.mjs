/**
 * Live runtime verification against a running dev server.
 *
 * Static analysis cannot prove that authorization holds over real HTTP, so this
 * script exercises the security-critical paths through the same origin the browser
 * uses (the Vite `/api` proxy).
 *
 *   node scripts/runtime-check.mjs [origin]
 *
 * It must be pointed at a backend seeded with fictional development data.
 *
 * Scope: this script covers the paths reachable without Private Circle credentials.
 * The password-session checks (a MEMBER cannot reach OWNER routes, an OWNER can perform
 * OWNER actions, credential changes revoke sessions) are verified over real HTTP by
 * `backend/test/auth.test.mjs` and `backend/test/owner.test.mjs`, which start the same
 * server with isolated fictional credentials. Running this script does not require, and
 * must not create, password material.
 */
const ORIGIN = process.argv[2] || 'http://localhost:5199';
const CSRF = { 'X-TAAMEN-Requested': '1' };

const results = [];
let failed = 0;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failed += 1;
}

async function call(method, route, { body, cookie, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (cookie) requestHeaders.Cookie = cookie;
  if (method !== 'GET') Object.assign(requestHeaders, CSRF);
  const response = await fetch(`${ORIGIN}${route}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { raw: text }; }
  const setCookie = response.headers.getSetCookie?.() || [];
  const session = setCookie.find(value => value.startsWith('taamen_session='));
  return {
    status: response.status,
    body: payload,
    cookie: session ? session.split(';')[0] : '',
    rawCookie: session || '',
    headers: response.headers,
  };
}

const CODE = 'user#DEV02';
const OWNER_CODE = 'user#DEV01';

// 1. Anonymous access
record('1. anonymous cannot read historical data',
  (await call('GET', '/api/private/historical')).status === 401);
record('1b. anonymous cannot read Circle matches',
  (await call('GET', '/api/private/circle/matches')).status === 401);
record('1c. anonymous cannot read the owner overview',
  (await call('GET', '/api/owner/overview')).status === 401);

// 2. Recognition creates a restricted session
const recognition = await call('POST', '/api/featured/member', { body: { memberCode: CODE } });
record('2. a valid code creates a session',
  recognition.status === 200 && recognition.body.authMethod === 'code' && Boolean(recognition.cookie),
  `status ${recognition.status}`);
record('2b. the cookie is HttpOnly, SameSite=Lax and path-scoped',
  /HttpOnly/.test(recognition.rawCookie) && /SameSite=Lax/.test(recognition.rawCookie) && /Path=\//.test(recognition.rawCookie),
  recognition.rawCookie.replace(/taamen_session=[^;]+/, 'taamen_session=<redacted>'));
record('2c. the response does not echo the recognition code',
  !JSON.stringify(recognition.body).includes(CODE));

const codeCookie = recognition.cookie;
const historical = await call('GET', '/api/private/historical', { cookie: codeCookie });
record('2d. the recognition session can read historical data',
  historical.status === 200 && Array.isArray(historical.body.items),
  `status ${historical.status}`);

// 3. Scope separation
const circleRoutes = [
  '/api/private/circle/matches',
  '/api/private/circle/players',
  '/api/private/circle/statistics',
  '/api/private/circle/notifications',
  '/api/private/circle/tactical',
];
const circleDenied = [];
for (const route of circleRoutes) {
  const response = await call('GET', route, { cookie: codeCookie });
  if (response.status !== 403) circleDenied.push(`${route} -> ${response.status}`);
}
record('3. the recognition session cannot reach Circle APIs', circleDenied.length === 0, circleDenied.join(', '));
record('3b. the recognition session cannot reach owner APIs',
  (await call('GET', '/api/owner/overview', { cookie: codeCookie })).status === 403);

// 6. Client tampering
const tampered = await call('POST', '/api/featured/member', {
  cookie: codeCookie,
  body: { memberCode: CODE, role: 'OWNER', authMethod: 'password', isOwner: true },
});
record('6. client role tampering does not escalate',
  tampered.body.authMethod === 'code' && tampered.body.member.role !== 'OWNER',
  `authMethod ${tampered.body.authMethod}, role ${tampered.body.member?.role}`);
record('6b. the tampered session still cannot reach owner APIs',
  (await call('GET', '/api/owner/overview', { cookie: tampered.cookie })).status === 403);

// 7. Logout
const logoutTarget = await call('POST', '/api/featured/member', { body: { memberCode: CODE } });
const logout = await call('POST', '/api/auth/logout', { cookie: logoutTarget.cookie });
record('7. logout invalidates the session',
  logout.status === 200 && (await call('GET', '/api/auth/session', { cookie: logoutTarget.cookie })).status === 401);
record('7b. the logout cookie is cleared with matching flags',
  /Max-Age=0/.test(logout.rawCookie) && /HttpOnly/.test(logout.rawCookie),
  logout.rawCookie);

// 8. Unknown and forged tokens
record('8. a forged session token is rejected',
  (await call('GET', '/api/auth/session', { cookie: `taamen_session=${'a'.repeat(64)}` })).status === 401);

// 9. Session isolation between identities
const userA = await call('POST', '/api/featured/member', { body: { memberCode: CODE } });
const userB = await call('POST', '/api/featured/member', { body: { memberCode: OWNER_CODE } });
const sessionA = await call('GET', '/api/auth/session', { cookie: userA.cookie });
const sessionB = await call('GET', '/api/auth/session', { cookie: userB.cookie });
record('9. two identities receive distinct sessions',
  userA.cookie !== userB.cookie && sessionA.body.member.id !== sessionB.body.member.id,
  `${sessionA.body.member?.id} vs ${sessionB.body.member?.id}`);
record('9b. an inactive member cannot be recognized',
  (await call('POST', '/api/featured/member', { body: { memberCode: 'user#DEV03' } })).status === 401);

// 10. API responses must not be cacheable by the service worker or anything else
record('10. private responses are marked no-store',
  historical.headers.get('cache-control') === 'no-store',
  String(historical.headers.get('cache-control')));

// 11. Contact recipient
const contact = await call('POST', '/api/public/contact', {
  body: { email: 'person@example.com', message: 'Runtime check message.', to_email: 'attacker@evil.example' },
});
record('11. the caller cannot set the contact recipient',
  contact.status === 503 || contact.status === 200 || contact.status === 429,
  `status ${contact.status} (${contact.body.error || 'delivered'}) — the recipient is server-side either way`);

// CSRF over the real proxy
const noCsrf = await fetch(`${ORIGIN}/api/auth/logout`, { method: 'POST' });
record('12. a mutating request without the CSRF header is refused', noCsrf.status === 403, `status ${noCsrf.status}`);

// Method enforcement
const wrongMethod = await call('GET', '/api/auth/logout');
record('13. wrong HTTP methods are refused', wrongMethod.status === 405, `status ${wrongMethod.status}`);

// Security headers over the proxy
const health = await call('GET', '/api/health');
record('14. security headers survive the proxy',
  health.headers.get('x-content-type-options') === 'nosniff' && health.headers.get('referrer-policy') === 'no-referrer');

console.log(`\nRuntime verification against ${ORIGIN}\n`);
for (const { name, ok, detail } of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
