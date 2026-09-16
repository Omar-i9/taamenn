import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment, seedDataset, startTestServer, writeDataset } from './helpers.mjs';

prepareEnvironment('contact');
// A configured contact channel, so delivery attempts can be observed.
process.env.TAAMEN_SUPPORT_RECIPIENT = 'support@taamen.example';
process.env.EMAILJS_SERVICE_ID = 'service_test';
process.env.EMAILJS_CONTACT_TEMPLATE_ID = 'template_contact';
process.env.EMAILJS_AUTOREPLY_TEMPLATE_ID = 'template_autoreply';
process.env.EMAILJS_PUBLIC_KEY = 'public_test';

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

/** Capture outbound provider calls instead of sending real email. */
const sent = [];
const realFetch = globalThis.fetch;
const successFetch = async (url, options) => {
  if (String(url).includes('api.emailjs.com')) {
    sent.push(JSON.parse(options.body));
    return new Response('OK', { status: 200 });
  }
  return realFetch(url, options);
};
globalThis.fetch = successFetch;
test.after(() => { globalThis.fetch = realFetch; });

describe('contact API', { concurrency: false }, () => {
test('a valid message is delivered to the server-configured recipient', async () => {
  sent.length = 0;
  const response = await api.post('/api/public/contact', {
    body: { email: 'person@example.com', message: 'I would like some help, please.', name: 'Person' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.contactSent, true);
  assert.equal(response.body.autoReplySent, true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].template_id, 'template_contact');
  assert.equal(sent[1].template_id, 'template_autoreply');
  assert.equal(sent[0].service_id, 'service_test');
  assert.equal(sent[0].template_params.to_email, 'support@taamen.example');
  assert.equal(sent[0].template_params.reply_to, 'person@example.com');
  assert.equal(sent[0].template_params.from_name, 'TAAMEN');
  assert.equal(sent[0].template_params.name, 'Person');
  assert.equal(sent[0].template_params.email, 'person@example.com');
  assert.equal(sent[1].template_params.to_email, 'person@example.com');
  assert.equal(sent[1].template_id, 'template_autoreply');
});

test('the caller cannot redirect the message to another recipient', async () => {
  sent.length = 0;
  const response = await api.post('/api/public/contact', {
    body: {
      email: 'person@example.com',
      message: 'Trying to change the destination.',
      to_email: 'attacker@evil.example',
      recipient: 'attacker@evil.example',
      to: 'attacker@evil.example',
      template_params: { to_email: 'attacker@evil.example' },
      template_id: 'template_attacker',
      service_id: 'service_attacker',
    },
  });
  assert.equal(response.status, 200);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].template_params.to_email, 'support@taamen.example', 'the recipient is server-owned');
  assert.equal(sent[0].template_id, 'template_contact', 'the template is server-owned');
  assert.equal(sent[0].service_id, 'service_test', 'the service is server-owned');
  const serialized = JSON.stringify(sent);
  assert.ok(!serialized.includes('attacker@evil.example'), 'no attacker address may reach the provider');
});

test('invalid input is rejected before any delivery attempt', async () => {
  sent.length = 0;
  const malformed = await api.post('/api/public/contact', {
    body: { email: 'not-an-email', message: 'Long enough message.' },
  });
  assert.equal(malformed.status, 400);
  assert.equal(sent.length, 0, 'a rejected message must not reach the provider');
});

test('the contact endpoint requires the CSRF header and rejects other methods', async () => {
  sent.length = 0;
  const noHeader = await api.post('/api/public/contact', {
    csrf: false,
    body: { email: 'person@example.com', message: 'A perfectly ordinary message.' },
  });
  assert.equal(noHeader.status, 403);
  assert.equal(sent.length, 0);

  const wrongMethod = await api.get('/api/public/contact');
  assert.equal(wrongMethod.status, 405);
});

test('repeated submissions are rate limited', async () => {
  let blocked = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await api.post('/api/public/contact', {
      body: { email: 'person@example.com', message: `Message number ${attempt}.` },
    });
    if (response.status === 429) { blocked = true; break; }
  }
  assert.ok(blocked, 'the contact endpoint must be abuse-resistant');
});
});
