import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeProfileShare, encodeProfileShare, makePublicProfilePayload, MAX_PROFILE_SHARE_TOKEN, profileShareUrl } from './profileShareService.ts';

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

test('decodeProfileShare ignores email, phone and member codes in a crafted token', () => {
  const token = tokenFrom({
    v: 2,
    type: 'profile',
    displayName: 'Public Name',
    email: 'secret@example.com',
    phone: '0590000000',
    memberCode: 'not-in-client',
  });
  const decoded = decodeProfileShare(token);
  assert.ok(decoded);
  assert.equal(decoded.displayName, 'Public Name');
  assert.equal('email' in decoded, false);
  assert.equal('phone' in decoded, false);
  assert.equal('memberCode' in decoded, false);
});

test('decodeProfileShare fails closed on malformed, tampered, or private display names', () => {
  assert.equal(decodeProfileShare('not-base64%%'), null);
  assert.equal(decodeProfileShare(tokenFrom({ v: 1, type: 'profile', displayName: 'Old' })), null);
  assert.equal(decodeProfileShare(tokenFrom({ v: 2, type: 'match', displayName: 'No' })), null);
  assert.equal(decodeProfileShare(tokenFrom({ v: 2, type: 'profile', displayName: 'secret@example.com' })), null);
  assert.equal(decodeProfileShare(tokenFrom({ v: 2, type: 'profile', displayName: '' })), null);
});

test('profileShareUrl drops images when the token would exceed the URI budget', () => {
  const huge = `data:image/png;base64,${'A'.repeat(20_000)}`;
  const url = profileShareUrl({
    id: 'current',
    firstName: 'Omar',
    lastName: 'G',
    email: 'secret@example.com',
    phone: '0590000000',
    avatarData: huge,
    bannerData: huge,
    emailVerified: false,
    updatedAt: 1,
  }, undefined, 'https://taamenn.com');
  const token = url.slice('https://taamenn.com/share/profile/'.length);
  assert.ok(token.length <= MAX_PROFILE_SHARE_TOKEN);
  const decoded = decodeProfileShare(token);
  assert.ok(decoded);
  assert.equal(decoded.displayName, 'Omar G');
  assert.equal(decoded.avatarData, undefined);
  assert.equal(decoded.bannerData, undefined);
  assert.match(url, /^https:\/\/taamenn.com\/share\/profile\//);
  assert.equal(encodeProfileShare(decoded).includes('secret@example.com'), false);
});
