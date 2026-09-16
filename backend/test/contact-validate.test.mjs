import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment, seedDataset, startTestServer, writeDataset } from './helpers.mjs';

prepareEnvironment('contact-validate');
process.env.TAAMEN_SUPPORT_RECIPIENT = 'support@taamen.example';
process.env.EMAILJS_SERVICE_ID = 'service_test';
process.env.EMAILJS_CONTACT_TEMPLATE_ID = 'template_contact';
process.env.EMAILJS_PUBLIC_KEY = 'public_test';

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (String(url).includes('api.emailjs.com')) {
    sent.push(JSON.parse(options.body));
    return new Response('OK', { status: 200 });
  }
  return realFetch(url, options);
};
test.after(() => { globalThis.fetch = realFetch; });

describe('contact validation', { concurrency: false }, () => {
  test('empty message is rejected', async () => {
    sent.length = 0;
    const response = await api.post('/api/public/contact', {
      body: { email: 'person@example.com', message: '   ' },
    });
    assert.equal(response.status, 400);
    assert.equal(sent.length, 0);
  });

  test('empty email is rejected', async () => {
    sent.length = 0;
    const response = await api.post('/api/public/contact', {
      body: { email: '', message: 'Long enough message.' },
    });
    assert.equal(response.status, 400);
    assert.equal(sent.length, 0);
  });

  test('oversized message is rejected', async () => {
    sent.length = 0;
    const response = await api.post('/api/public/contact', {
      body: { email: 'person@example.com', message: 'm'.repeat(2001) },
    });
    assert.equal(response.status, 400);
    assert.equal(sent.length, 0);
  });
});
