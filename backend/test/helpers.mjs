import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Every test file gets its own dataset, session store and members, so tests cannot
 * observe each other's state. The environment must be prepared before the server
 * modules are imported, because config is read at import time.
 */
export function prepareEnvironment(label) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `taamen-${label}-`));
  process.env.TAAMEN_DATA_FILE = path.join(dir, 'data.json');
  process.env.TAAMEN_SESSION_FILE = path.join(dir, 'sessions.json');
  process.env.TAAMEN_LEGACY_FILE = path.join(dir, 'legacy-absent.json');
  process.env.NODE_ENV = 'test';
  process.env.CORS_ORIGIN = 'http://localhost:5173';
  process.env.TRUST_PROXY = 'false';
  return dir;
}

export const OWNER_PASSWORD = 'owner-password-1234';
export const MEMBER_PASSWORD = 'member-password-1234';

/** A fictional dataset shaped like the operator dataset. */
export function seedDataset(hashPassword) {
  return {
    schemaVersion: 1,
    members: [
      {
        id: 'member-owner',
        username: 'test-owner',
        displayName: 'Test Owner',
        arabicName: 'مالك',
        role: 'OWNER',
        active: true,
        memberCode: 'user#OWNER1',
        passwordHash: hashPassword(OWNER_PASSWORD),
      },
      {
        id: 'member-regular',
        username: 'test-member',
        displayName: 'Test Member',
        arabicName: 'عضو',
        role: 'MEMBER',
        active: true,
        memberCode: 'user#MEMBER1',
        passwordHash: hashPassword(MEMBER_PASSWORD),
      },
      {
        id: 'member-inactive',
        username: 'test-inactive',
        displayName: 'Test Inactive',
        role: 'MEMBER',
        active: false,
        memberCode: 'user#GONE1',
        passwordHash: hashPassword(MEMBER_PASSWORD),
      },
    ],
    players: [
      { id: 'player-1', displayName: 'Player One', role: 'Player', preferredPosition: 'ST', currentStatus: 'active', legacyStats: { appearances: 2, goals: 3, averageRating: 8 } },
    ],
    matches: [
      { id: 'T-001', type: 'normal', team1: 'Alpha', team2: 'Beta', score1: 2, score2: 1, status: 'ARCHIVED', dateLabel: '01/01/2026', dateKey: 20260101, story: 'Test record one.', visibility: 'PRIVATE', details: { team1: { possession: 50, shots: 5, onTarget: 3, saves: 1, assists: 1, passes: 40, fouls: 0, corners: 1 }, team2: { possession: 50, shots: 4, onTarget: 2, saves: 2, assists: 0, passes: 38, fouls: 1, corners: 2 } } },
      { id: 'T-002', type: 'friendly', team1: 'Beta', team2: 'Alpha', score1: 0, score2: 0, status: 'ARCHIVED', dateLabel: '08/01/2026', dateKey: 20260108, story: 'Test record two.', visibility: 'PRIVATE' },
    ],
    notifications: [
      { id: 'n-shared', title: 'Shared notice', titleAr: 'إشعار عام', body: 'For everyone.', createdAt: 1000, read: false },
      { id: 'n-owner', memberId: 'member-owner', title: 'Owner notice', body: 'Owner only.', createdAt: 2000, read: false },
      { id: 'n-member', memberId: 'member-regular', title: 'Member notice', body: 'Member only.', createdAt: 3000, read: false },
    ],
    performance: [],
    invitations: [],
    audit: [],
    tacticalPlan: null,
  };
}

export function writeDataset(dataset) {
  fs.writeFileSync(process.env.TAAMEN_DATA_FILE, JSON.stringify(dataset, null, 2), 'utf8');
}

/** Start the server on an ephemeral port and return a small request client. */
export async function startTestServer(createServer) {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  /**
   * `cookie` is passed explicitly rather than kept in a shared jar, so each test
   * states which identity it is acting as.
   */
  async function call(method, route, { body, cookie, headers = {}, csrf = true } = {}) {
    const requestHeaders = { ...headers };
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
    if (cookie) requestHeaders.Cookie = cookie;
    if (csrf && method !== 'GET') requestHeaders['X-TAAMEN-Requested'] = '1';

    const response = await fetch(`${base}${route}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { raw: text }; }
    return {
      status: response.status,
      body: payload,
      setCookie: response.headers.getSetCookie?.() || [],
      headers: response.headers,
    };
  }

  return {
    base,
    call,
    get: (route, options) => call('GET', route, options),
    post: (route, options) => call('POST', route, options),
    close: () => new Promise(resolve => server.close(resolve)),
  };
}

/** Extract the session cookie pair from a Set-Cookie list. */
export function cookieFrom(response) {
  const header = response.setCookie.find(value => value.startsWith('taamen_session='));
  if (!header) return '';
  return header.split(';')[0];
}
