import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeProfileShare, makePublicProfilePayload } from './profileShareService.ts';

function tokenFrom(payload: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

test('profile share drops email and phone and keeps only a public display name', () => {
  const payload = makePublicProfilePayload({
    id: 'current',
    firstName: 'Omar',
    lastName: 'G',
    email: 'secret@example.com',
    phone: '0590000000',
    avatarData: 'data:image/png;base64,abc',
    bannerData: '',
    emailVerified: false,
    updatedAt: 1,
  });
  assert.equal(payload.displayName, 'Omar G');
  assert.equal('email' in payload, false);
  assert.equal('phone' in payload, false);
  assert.equal(payload.avatarData, 'data:image/png;base64,abc');
});

test('decodeProfileShare rejects non-image data URLs', () => {
  const token = tokenFrom({
    v: 2,
    type: 'profile',
    displayName: 'Safe',
    avatarData: 'javascript:alert(1)',
    bannerData: 'data:text/html;base64,PHNjcmlwdD4=',
  });
  const decoded = decodeProfileShare(token);
  assert.ok(decoded);
  assert.equal(decoded.avatarData, undefined);
  assert.equal(decoded.bannerData, undefined);
});
