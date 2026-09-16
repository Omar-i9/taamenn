import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cookieFrom, prepareEnvironment, startTestServer, writeDataset,
} from './helpers.mjs';
import { FEATURED_MEMBERS, featuredMemberRecord, syncFeaturedMembers } from '../src/featuredMembers.mjs';

prepareEnvironment('featured');

const EXPECTED_CODES = [
  'user#E9772', 'user#223G5', 'user#13F4', 'user#93D07', 'user#03651', 'user#C7E7E',
  'user#B67E6', 'user#3C885', 'user#7A2D1', 'user#D83F2', 'user#91B6D', 'user#E52A9',
];

writeDataset({
  schemaVersion: 1,
  members: FEATURED_MEMBERS.map(member => featuredMemberRecord(member)),
  players: [],
  matches: [],
  notifications: [],
  performance: [],
  invitations: [],
  audit: [],
  tacticalPlan: null,
});

const { createServer } = await import('../src/server.mjs');
const { store } = await import('../src/store.mjs');
await store.load();

const api = await startTestServer(createServer);
test.after(() => api.close());

test('the Featured directory is exactly twelve members with stable identifiers', () => {
  assert.equal(FEATURED_MEMBERS.length, 12);
  assert.deepEqual(FEATURED_MEMBERS.map(member => member.memberCode), EXPECTED_CODES);
  assert.equal(new Set(FEATURED_MEMBERS.map(member => member.id)).size, 12);
  assert.equal(new Set(FEATURED_MEMBERS.map(member => member.username)).size, 12);
  for (const member of FEATURED_MEMBERS) {
    assert.equal(member.password, undefined);
    assert.equal(member.passwordHash, undefined);
    assert.match(member.id, /^member-/);
  }
  const muhammad = FEATURED_MEMBERS.find(member => member.memberCode === 'user#91B6D');
  assert.equal(muhammad.username, 'muhammad');
  assert.equal(muhammad.displayName, 'محمد ناصر الدين');
});

test('sync replaces the member collection and preserves matches', () => {
  const data = {
    members: [{ id: 'kept-omar', username: 'legacy', memberCode: 'user#E9772', role: 'MEMBER' }],
    matches: [{ id: 'MATCH-1' }],
  };
  syncFeaturedMembers(data);
  assert.equal(data.members.length, 12);
  assert.equal(data.members[0].id, 'kept-omar');
  assert.equal(data.members[0].username, 'omar');
  assert.equal(data.members[0].role, 'FEATURED_MEMBER');
  assert.equal(data.matches.length, 1);
  assert.ok(data.members.every(member => member.passwordHash === undefined));
});

test('Featured recognition accepts the canonical IDs and rejects others without leakage', async () => {
  for (const memberCode of EXPECTED_CODES) {
    const response = await api.post('/api/featured/member', { body: { memberCode } });
    assert.equal(response.status, 200, `${memberCode} must be recognized`);
    assert.equal(response.body.authenticated, true);
    assert.equal(response.body.member.role, 'FEATURED_MEMBER');
    const serialized = JSON.stringify(response.body);
    assert.ok(!serialized.includes(memberCode), `${memberCode} must not be echoed`);
    assert.equal(cookieFrom(response).startsWith('taamen_session='), true);
  }

  const caseInsensitive = await api.post('/api/featured/member', { body: { memberCode: '  USER#e9772  ' } });
  assert.equal(caseInsensitive.status, 200);

  const invalid = ['user#NOPE', 'user#', 'not-a-code', 'user#91B6D0'];
  for (const memberCode of invalid) {
    const response = await api.post('/api/featured/member', { body: { memberCode } });
    assert.equal(response.status, 401, `${memberCode} must be rejected`);
    assert.equal(response.body.error, 'Invalid member ID.');
    const serialized = JSON.stringify(response.body);
    for (const code of EXPECTED_CODES) {
      assert.ok(!serialized.includes(code), `response must not mention ${code}`);
    }
    assert.ok(!serialized.includes('omar'));
  }

  const empty = await api.post('/api/featured/member', { body: { memberCode: '' } });
  assert.equal(empty.status, 400);

  const whitespace = await api.post('/api/featured/member', { body: { memberCode: '   ' } });
  assert.equal(whitespace.status, 400);
});
