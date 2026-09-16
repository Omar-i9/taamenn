import assert from 'node:assert/strict';
import test from 'node:test';
import { OFFICIAL_SUPPORT_PHONE, WHATSAPP_CHANNEL_URL, whatsAppUrlFromPhone } from '../config/support.ts';

test('official WhatsApp chat URL is wa.me with country code digits only', () => {
  assert.equal(OFFICIAL_SUPPORT_PHONE, '+970594054750');
  assert.equal(whatsAppUrlFromPhone(OFFICIAL_SUPPORT_PHONE), 'https://wa.me/970594054750');
  assert.equal(WHATSAPP_CHANNEL_URL, 'https://whatsapp.com/channel/0029VbDL3R2I1rcpDnMnlQ09');
});
