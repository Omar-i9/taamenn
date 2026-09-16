import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cookieFrom, prepareEnvironment, seedDataset, startTestServer, writeDataset,
} from './helpers.mjs';

prepareEnvironment('owner');

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

test('owner administration routes are not part of the product', async () => {
  const recognition = await api.post('/api/featured/member', { body: { memberCode: 'user#OWNER1' } });
  assert.equal(recognition.status, 200);
  const cookie = cookieFrom(recognition);

  assert.equal((await api.get('/api/owner/overview')).status, 404);
  assert.equal((await api.get('/api/owner/overview', { cookie })).status, 404);
  assert.equal((await api.post('/api/owner/members/member-regular/reset-password', {
    cookie,
    body: { newPassword: 'replacement-password-99' },
  })).status, 404);
  assert.equal((await api.post('/api/owner/members/member-regular/status', {
    cookie,
    body: { active: false },
  })).status, 404);
});
