import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment, seedDataset, startTestServer, writeDataset } from './helpers.mjs';

prepareEnvironment('contact-origin');
process.env.TAAMEN_SUPPORT_RECIPIENT = 'support@taamen.example';
process.env.EMAILJS_SERVICE_ID = 'service_test';
process.env.EMAILJS_CONTACT_TEMPLATE_ID = 'template_contact';
process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID = '';
process.env.EMAILJS_PUBLIC_KEY = 'public_test';
process.env.EMAILJS_ORIGIN = 'https://taamenn.com';

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();
const api = await startTestServer(createServer);
test.after(() => api.close());

const origins = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (String(url).includes('api.emailjs.com')) {
    origins.push(options.headers.Origin);
    return new Response('OK', { status: 200 });
  }
  return realFetch(url, options);
};
test.after(() => { globalThis.fetch = realFetch; });

test('EmailJS Origin is the configured production origin, not localhost:5173', async () => {
  const response = await api.post('/api/public/contact', {
    body: { email: 'person@example.com', message: 'Origin must be taamenn.com.' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(origins, ['https://taamenn.com']);
  assert.ok(!origins.includes('http://localhost:5173'));
});
