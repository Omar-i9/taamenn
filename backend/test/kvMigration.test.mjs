import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURED_MEMBERS } from '../src/featuredMembers.mjs';
import {
  isDemoMatch, prepareKvDocument, emptyProductionDataset,
} from '../src/kvMigration.mjs';

const historical = [
  {
    id: 'T-100',
    type: 'normal',
    team1: 'Alpha',
    team2: 'Beta',
    score1: 2,
    score2: 1,
    status: 'ARCHIVED',
    dateLabel: '01/01/2024',
    dateKey: 20240101,
    dateISO: '2024-01-01',
    story: 'Real historical record.',
    source: 'legacy-taamenn',
    visibility: 'PRIVATE',
    createdAt: 1_700_000_111,
    passwordHash: { salt: 'nope', digest: 'nope' },
    token: 'raw-session-must-not-survive',
  },
  {
    id: 'T-101',
    type: 'friendly',
    team1: 'Beta',
    team2: 'Alpha',
    score1: 0,
    score2: 0,
    status: 'ARCHIVED',
    dateLabel: '08/01/2024',
    dateKey: 20240108,
    story: 'Second historical record.',
    source: 'legacy-taamenn',
  },
];

test('demo fixtures are classified and excluded from production KV data', () => {
  assert.equal(isDemoMatch({ id: 'DEV-001', story: 'x' }), true);
  assert.equal(isDemoMatch({ id: 'T-100', story: 'Real historical record.' }), false);
  const { data, report } = prepareKvDocument({
    source: {
      members: [{ id: 'evil', username: 'x', displayName: 'x', role: 'OWNER', passwordHash: { digest: 'abc' } }],
      matches: [
        { id: 'DEV-001', team1: 'A', team2: 'B', story: 'Development fixture record. Not real TAAMEN data.' },
        historical[0],
      ],
    },
    legacyMatches: historical,
  });
  assert.equal(data.members.length, 12);
  assert.deepEqual(data.members.map(m => m.id), FEATURED_MEMBERS.map(m => m.id));
  assert.ok(data.members.every(m => m.passwordHash === undefined));
  assert.ok(data.members.every(m => m.memberCode && m.role === 'FEATURED_MEMBER'));
  assert.equal(data.matches.length, 2);
  assert.deepEqual(data.matches.map(m => m.id).sort(), ['T-100', 'T-101']);
  assert.equal(data.matches[0].id, 'T-101'); // sorted by dateKey descending
  assert.equal(data.matches.find(m => m.id === 'T-100').dateKey, 20240101);
  assert.equal(data.matches.find(m => m.id === 'T-100').createdAt, 1_700_000_111);
  assert.equal(data.matches.find(m => m.id === 'T-100').passwordHash, undefined);
  assert.equal(data.matches.find(m => m.id === 'T-100').token, undefined);
  assert.equal(JSON.stringify(data).includes('raw-session-must-not-survive'), false);
  assert.equal(data.sessions, undefined);
  assert.equal(report.sessionsIncluded, false);
  assert.ok(report.fromSource.skippedDemo.includes('DEV-001'));
  assert.ok(report.fromLegacy.skippedDuplicate.includes('T-100'));
});

test('the migration is idempotent and never invents match fields', () => {
  const first = prepareKvDocument({ legacyMatches: historical });
  const second = prepareKvDocument({ legacyMatches: historical, source: first.data });
  assert.equal(second.data.matches.length, 2);
  assert.equal(second.report.fromLegacy.skippedDuplicate.length, 2);
  assert.equal(second.report.recordsLost, false);
  assert.equal(second.report.kvKey, 'data');
  assert.equal(second.data.matches.find(m => m.id === 'T-100').stadium, undefined);
  assert.equal(second.data.matches.find(m => m.id === 'T-100').city, undefined);
});

test('an empty production dataset has twelve featured members and no demo matches', () => {
  const { data } = prepareKvDocument({});
  assert.equal(data.members.length, 12);
  assert.equal(data.matches.length, 0);
  assert.deepEqual(emptyProductionDataset().matches, []);
});
