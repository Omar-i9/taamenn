import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, api, asRecognitionSession } from './apiClient.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(status: number, body: unknown, contentType = 'application/json') {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });
}

test('asRecognitionSession rejects HTML-shaped or empty payloads', () => {
  assert.throws(() => asRecognitionSession({}), (error: unknown) => error instanceof ApiError && error.status === 502);
  assert.throws(() => asRecognitionSession({ authenticated: true, authMethod: 'password' }), (error: unknown) => error instanceof ApiError && error.status === 502);
});

test('recognizeMember does not treat a 200 HTML page as a session', async () => {
  globalThis.fetch = (async () => new Response('<!doctype html><title>TAAMEN</title>', {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })) as typeof fetch;
  await assert.rejects(
    () => api.recognizeMember('anything'),
    (error: unknown) => error instanceof ApiError && (error as ApiError).status === 502,
  );
});

test('recognizeMember maps a network failure to status 0', async () => {
  globalThis.fetch = (async () => { throw new TypeError('Failed to fetch'); }) as typeof fetch;
  await assert.rejects(
    () => api.recognizeMember('anything'),
    (error: unknown) => error instanceof ApiError && (error as ApiError).status === 0,
  );
});

test('recognizeMember accepts a real recognition session and 401 stays 401', async () => {
  globalThis.fetch = (async (_url, options) => {
    const url = String(_url);
    if (url.endsWith('/featured/member') && options && typeof options.body === 'string' && options.body.includes('good')) {
      return jsonResponse(200, {
        authenticated: true,
        authMethod: 'code',
        member: { id: 'member-1', displayName: 'Test', arabicName: '', role: 'FEATURED_MEMBER' },
        expiresAt: 9,
      });
    }
    return jsonResponse(401, { error: 'Invalid member ID.' });
  }) as typeof fetch;
  const session = await api.recognizeMember('good');
  assert.equal(session.authMethod, 'code');
  assert.equal(session.member.id, 'member-1');
  await assert.rejects(() => api.recognizeMember('bad'), (error: unknown) => error instanceof ApiError && (error as ApiError).status === 401);
});

test('sendContactMessage requires contactSent from the API', async () => {
  globalThis.fetch = (async () => jsonResponse(200, { ok: true, contactSent: false })) as typeof fetch;
  await assert.rejects(
    () => api.sendContactMessage({ email: 'person@example.com', message: 'Hello there' }),
    (error: unknown) => error instanceof ApiError && (error as ApiError).status === 502,
  );

  globalThis.fetch = (async () => jsonResponse(200, { ok: true, contactSent: true, autoReplySent: false })) as typeof fetch;
  const result = await api.sendContactMessage({ email: 'person@example.com', message: 'Hello there' });
  assert.equal(result.contactSent, true);
  assert.equal(result.autoReplySent, false);
});

test('session returns null for unauthenticated JSON and does not invent a user', async () => {
  globalThis.fetch = (async () => jsonResponse(200, { authenticated: false })) as typeof fetch;
  assert.equal(await api.session(), null);
});
