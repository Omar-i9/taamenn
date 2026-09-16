import assert from 'node:assert/strict';
import test from 'node:test';
import { allowProfileRouteChange, isProfileDraftDirty, profileDraftDiffKeys, type LocalProfile } from './profileDraft.ts';

const saved = (patch: Partial<LocalProfile> = {}): LocalProfile => ({
  id: 'current',
  firstName: 'Omar',
  lastName: 'G',
  email: 'omar@example.com',
  phone: '0590000000',
  avatarData: 'data:image/webp;base64,aaa',
  bannerData: 'data:image/webp;base64,bbb',
  emailVerified: false,
  updatedAt: 1,
  ...patch,
});

test('identical draft is clean', () => {
  const profile = saved();
  assert.equal(isProfileDraftDirty(profile, { ...profile }), false);
  assert.deepEqual(profileDraftDiffKeys(profile, { ...profile }), []);
});

test('empty and missing image fields compare as the same saved value', () => {
  const profile = saved({ avatarData: undefined, bannerData: undefined });
  const draft = saved({ avatarData: '', bannerData: '' });
  assert.equal(isProfileDraftDirty(profile, draft), false);
});

test('any editable field change marks the draft dirty and reverts to clean', () => {
  const profile = saved();
  assert.equal(isProfileDraftDirty(profile, { ...profile, firstName: 'Ali' }), true);
  assert.deepEqual(profileDraftDiffKeys(profile, { ...profile, firstName: 'Ali' }), ['firstName']);
  assert.equal(isProfileDraftDirty(profile, { ...profile, firstName: 'Omar' }), false);
  assert.equal(isProfileDraftDirty(profile, { ...profile, lastName: 'H' }), true);
  assert.equal(isProfileDraftDirty(profile, { ...profile, email: 'a@b.c' }), true);
  assert.equal(isProfileDraftDirty(profile, { ...profile, phone: '1' }), true);
  assert.equal(isProfileDraftDirty(profile, { ...profile, avatarData: 'data:image/webp;base64,new' }), true);
  assert.equal(isProfileDraftDirty(profile, { ...profile, bannerData: 'data:image/webp;base64,new' }), true);
});

test('non-editable timestamps do not make the draft dirty', () => {
  const profile = saved();
  assert.equal(isProfileDraftDirty(profile, { ...profile, updatedAt: 99, emailVerified: true }), false);
});

test('in-app navigation is blocked only while the profile is dirty and the route changes', () => {
  assert.equal(allowProfileRouteChange('profile', 'profile', true), true);
  assert.equal(allowProfileRouteChange('profile', 'home', false), true);
  assert.equal(allowProfileRouteChange('profile', 'home', true), false);
  assert.equal(allowProfileRouteChange('profile', 'settings', true), false);
});
