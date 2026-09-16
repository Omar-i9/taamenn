import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment, seedDataset, startTestServer, writeDataset } from './helpers.mjs';

prepareEnvironment('contact-delivery');
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

describe('contact delivery', { concurrency: false }, () => {
  test('auto-reply failure does not fail a successful contact send', async () => {
    globalThis.fetch = async (url, options) => {
      if (String(url).includes('api.emailjs.com')) {
        const body = JSON.parse(options.body);
        sent.push(body);
        if (body.template_id === 'template_autoreply') return new Response('fail', { status: 500 });
        return new Response('OK', { status: 200 });
      }
      return realFetch(url, options);
    };
    try {
      sent.length = 0;
      const response = await api.post('/api/public/contact', {
        body: { email: 'person@example.com', message: 'Contact should succeed without auto-reply.' },
      });
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);
      assert.equal(response.body.contactSent, true);
      assert.equal(response.body.autoReplySent, false);
      assert.equal(sent.length, 2);
    } finally {
      globalThis.fetch = successFetch;
    }
  });

  test('a contact provider failure is reported without sending auto-reply', async () => {
    globalThis.fetch = async (url, options) => {
      if (String(url).includes('api.emailjs.com')) {
        sent.push(JSON.parse(options.body));
        return new Response('fail', { status: 500 });
      }
      return realFetch(url, options);
    };
    try {
      sent.length = 0;
      const response = await api.post('/api/public/contact', {
        body: { email: 'person@example.com', message: 'This delivery should fail.' },
      });
      assert.equal(response.status, 502);
      assert.equal(response.body.contactSent, undefined);
      assert.equal(sent.length, 1);
      assert.equal(sent[0].template_id, 'template_contact');
    } finally {
      globalThis.fetch = successFetch;
    }
  });

  test('Arabic names and messages are accepted', async () => {
    sent.length = 0;
    const response = await api.post('/api/public/contact', {
      body: { email: 'person@example.com', message: 'أرغب في المساعدة من فضلكم.', name: 'عمر ابوزينة' },
    });
    assert.equal(response.status, 200);
    assert.equal(sent[0].template_params.user_name, 'عمر ابوزينة');
    assert.equal(sent[0].template_params.message, 'أرغب في المساعدة من فضلكم.');
  });
});
