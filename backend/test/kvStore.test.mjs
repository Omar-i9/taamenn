import test from 'node:test';
import assert from 'node:assert/strict';
import { createKvJsonFile } from '../src/kvStore.mjs';
import { validateSessions } from '../src/sessions.mjs';
import { createSession, readSession, destroySession } from '../src/sessions.mjs';
import { setStores, resetStores } from '../src/runtime.mjs';
import { validateData } from '../src/store.mjs';

function memoryKv(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async put(key, value) {
      map.set(key, value);
    },
    snapshot() {
      return Object.fromEntries(map);
    },
  };
}

test('KV session records survive an isolate restart and never store the raw token', async () => {
  const kv = memoryKv();
  setStores({
    data: createKvJsonFile({ kv, key: 'data', validate: validateData, createFallback: async () => ({ schemaVersion: 1 }) }),
    sessions: createKvJsonFile({ kv, key: 'sessions', validate: validateSessions, createFallback: async () => ({ records: {} }) }),
  });

  const { token, expiresAt } = await createSession({ memberId: 'member-omar', authMethod: 'code', role: 'FEATURED_MEMBER' });
  assert.equal(token.length, 64);
  assert.match(token, /^[a-f0-9]{64}$/);
  const stored = kv.snapshot().sessions;
  assert.ok(!stored.includes(token), 'raw token must not be persisted');
  assert.ok(JSON.parse(stored).records, 'digest map is stored');
  assert.equal((await readSession(token)).memberId, 'member-omar');
  assert.ok(expiresAt > Date.now());

  resetStores();
  setStores({
    data: createKvJsonFile({ kv, key: 'data', validate: validateData, createFallback: async () => ({ schemaVersion: 1 }) }),
    sessions: createKvJsonFile({ kv, key: 'sessions', validate: validateSessions, createFallback: async () => ({ records: {} }) }),
  });
  const restored = await readSession(token);
  assert.ok(restored, 'a new isolate must reload the session from KV');
  assert.equal(restored.authMethod, 'code');

  await destroySession(token);
  resetStores();
  setStores({
    sessions: createKvJsonFile({ kv, key: 'sessions', validate: validateSessions, createFallback: async () => ({ records: {} }) }),
    data: createKvJsonFile({ kv, key: 'data', validate: validateData, createFallback: async () => ({ schemaVersion: 1 }) }),
  });
  assert.equal(await readSession(token), null, 'logout must persist across restart');
  resetStores();
});

test('unreadable KV data is not replaced with fallback seed', async () => {
  const kv = memoryKv({ data: '{ not json' });
  const store = createKvJsonFile({
    kv,
    key: 'data',
    validate: input => input,
    createFallback: async () => ({ wiped: true }),
  });
  await assert.rejects(() => store.load());
  assert.equal(kv.snapshot().data, '{ not json');
});
