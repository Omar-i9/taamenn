import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment, seedDataset, startTestServer, writeDataset } from './helpers.mjs';

prepareEnvironment('contact-unconfigured');
process.env.TAAMEN_SUPPORT_RECIPIENT = '';
process.env.EMAILJS_SERVICE_ID = '';
process.env.EMAILJS_CONTACT_TEMPLATE_ID = '';
process.env.EMAILJS_PUBLIC_KEY = '';

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { applyEnv } = await import('../src/config.mjs');
applyEnv({
  TAAMEN_SUPPORT_RECIPIENT: '',
  EMAILJS_SERVICE_ID: '',
  EMAILJS_CONTACT_TEMPLATE_ID: '',
  EMAILJS_PUBLIC_KEY: '',
});
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

test('unconfigured contact is 503 and never calls EmailJS', async () => {
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('api.emailjs.com')) {
      sent.push(options);
      return new Response('OK', { status: 200 });
    }
    return realFetch(url, options);
  };
  try {
    const response = await api.post('/api/public/contact', {
      body: { email: 'person@example.com', message: 'Should not be delivered.' },
    });
    assert.equal(response.status, 503);
    assert.equal(sent.length, 0);
    assert.deepEqual(Object.keys(response.body), ['error']);
  } finally {
    globalThis.fetch = realFetch;
  }
});
