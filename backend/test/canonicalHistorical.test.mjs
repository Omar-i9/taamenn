import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FEATURED_MEMBERS } from '../src/featuredMembers.mjs';
import { validateData } from '../src/store.mjs';
import { createKvJsonFile } from '../src/kvStore.mjs';
import { validateSessions } from '../src/sessions.mjs';
import {
  inspectCanonicalSource,
  prepareKvDocument,
} from '../src/kvMigration.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANONICAL_PATH = path.join(ROOT, 'backend/legacy-private-matches.json');
const PREPARE_SCRIPT = path.join(ROOT, 'scripts/prepare-kv-data.mjs');

function loadCanonical() {
  assert.equal(fs.existsSync(CANONICAL_PATH), true, 'canonical historical file must be tracked');
  const raw = fs.readFileSync(CANONICAL_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return { raw, parsed };
}

function memoryKv(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    async get(key) {
      return map.has(key) ? map.get(key) : null;
    },
    async put(key, value) {
      map.set(key, value);
    },
    snapshot() {
      return Object.fromEntries(map);
    },
  };
}

test('canonical historical file loads as a JSON array with unique valid IDs', () => {
  const { parsed } = loadCanonical();
  const inspection = inspectCanonicalSource(parsed);
  assert.equal(Array.isArray(parsed), true);
  assert.equal(inspection.ok, true, inspection.error);
  assert.equal(inspection.inputCount, parsed.length);
  assert.equal(inspection.uniqueCount, parsed.length);
  assert.deepEqual(inspection.duplicateIds, []);
  assert.deepEqual(inspection.invalid, []);
  const ids = parsed.map(match => match.id);
  assert.equal(new Set(ids).size, parsed.length);
  for (const match of parsed) {
    assert.equal(typeof match.id, 'string');
    assert.match(match.id, /^M-\d+$/);
    assert.equal(typeof match.type, 'string');
    assert.equal(typeof match.team1, 'string');
    assert.equal(typeof match.team2, 'string');
    assert.equal(typeof match.score1, 'number');
    assert.equal(typeof match.score2, 'number');
    assert.equal(typeof match.status, 'string');
    assert.equal(typeof match.dateLabel, 'string');
    assert.equal(typeof match.dateKey, 'number');
    assert.equal(match.visibility, 'PRIVATE');
    assert.equal(match.password, undefined);
    assert.equal(match.passwordHash, undefined);
    assert.equal(match.token, undefined);
  }
});

test('duplicate IDs in a historical snapshot are detected', () => {
  const { parsed } = loadCanonical();
  const duplicated = [parsed[0], { ...parsed[0] }, parsed[1]];
  const inspection = inspectCanonicalSource(duplicated);
  assert.equal(inspection.ok, false);
  assert.equal(inspection.error, 'duplicate-ids');
  assert.ok(inspection.duplicateIds.includes(parsed[0].id));
});

test('schema errors in a historical snapshot are explicit', () => {
  assert.equal(inspectCanonicalSource({}).ok, false);
  assert.equal(inspectCanonicalSource({}).error, 'not-array');
  const broken = inspectCanonicalSource([
    { team1: 'A', team2: 'B', score1: 1, score2: 0 },
    { id: 99, type: 'normal', team1: 'A', team2: 'B', score1: 1, score2: 0, status: 'ARCHIVED', dateLabel: 'x', dateKey: 20200101 },
  ]);
  assert.equal(broken.ok, false);
  assert.equal(broken.error, 'invalid-schema');
  assert.ok(broken.invalid.length >= 2);
});

test('canonical migration preserves every record, IDs, and scores', () => {
  const { parsed } = loadCanonical();
  const { data, report } = prepareKvDocument({ legacyMatches: parsed });
  const validated = validateData(data);

  assert.equal(report.kvKey, 'data');
  assert.equal(report.sessionsIncluded, false);
  assert.equal(data.sessions, undefined);
  assert.equal(report.recordsLost, false);
  assert.equal(report.fromLegacy.skippedInvalid.length, 0);
  assert.equal(report.fromLegacy.skippedDuplicate.length, 0);
  assert.equal(report.fromLegacy.added.length, parsed.length);
  assert.equal(report.matches, parsed.length);
  assert.equal(report.postMigrationCount, parsed.length);
  assert.equal(validated.matches.length, parsed.length);
  assert.equal(validated.members.length, 12);
  assert.deepEqual(validated.members.map(member => member.id), FEATURED_MEMBERS.map(member => member.id));

  const byId = new Map(validated.matches.map(match => [match.id, match]));
  for (const original of parsed) {
    const migrated = byId.get(original.id);
    assert.ok(migrated, `missing migrated record ${original.id}`);
    assert.equal(migrated.team1, original.team1);
    assert.equal(migrated.team2, original.team2);
    assert.equal(migrated.score1, original.score1);
    assert.equal(migrated.score2, original.score2);
    assert.equal(migrated.status, original.status);
    assert.equal(migrated.dateLabel, original.dateLabel);
    assert.equal(migrated.dateKey, original.dateKey);
    assert.equal(migrated.story, original.story);
    assert.equal(migrated.type, original.type);
    assert.equal(migrated.visibility, 'PRIVATE');
    assert.equal(migrated.source, 'legacy');
    assert.deepEqual(migrated.details, original.details);
  }
  assert.equal(JSON.stringify(data).includes('passwordHash'), false);
  assert.equal(JSON.stringify(data).includes('EMAILJS_PRIVATE_KEY'), false);
});

test('canonical migration is idempotent and does not duplicate records', () => {
  const { parsed } = loadCanonical();
  const first = prepareKvDocument({ legacyMatches: parsed });
  const second = prepareKvDocument({ legacyMatches: parsed, source: first.data });
  const third = prepareKvDocument({ legacyMatches: parsed, source: second.data });
  assert.equal(first.data.matches.length, parsed.length);
  assert.equal(second.data.matches.length, parsed.length);
  assert.equal(third.data.matches.length, parsed.length);
  assert.equal(second.report.fromLegacy.skippedDuplicate.length, parsed.length);
  assert.equal(third.report.fromLegacy.skippedDuplicate.length, parsed.length);
  assert.deepEqual(
    second.data.matches.map(match => match.id).sort(),
    first.data.matches.map(match => match.id).sort(),
  );
});

test('prepared canonical document is compatible with the Worker KV data key', async () => {
  const { parsed } = loadCanonical();
  const { data } = prepareKvDocument({ legacyMatches: parsed });
  const kv = memoryKv();
  const store = createKvJsonFile({
    kv,
    key: 'data',
    validate: validateData,
    createFallback: async () => ({ schemaVersion: 1 }),
  });
  const sessions = createKvJsonFile({
    kv,
    key: 'sessions',
    validate: validateSessions,
    createFallback: async () => ({ records: {} }),
  });
  await store.update(current => {
    Object.assign(current, data);
  });
  await sessions.load();
  const stored = JSON.parse(kv.snapshot().data);
  assert.equal(stored.matches.length, parsed.length);
  assert.equal(stored.members.length, 12);
  assert.equal(Object.prototype.hasOwnProperty.call(JSON.parse(kv.snapshot().data), 'sessions'), false);
  const sessionDoc = JSON.parse(kv.snapshot().sessions);
  assert.deepEqual(sessionDoc, { records: {} });
  assert.ok(!JSON.stringify(stored).includes('taamen_session='));
});

test('kv:prepare writes the canonical dataset and refuses duplicates', () => {
  const { parsed } = loadCanonical();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taamen-kv-prepare-'));
  const out = path.join(dir, 'kv-data.json');
  const result = spawnSync(process.execPath, [PREPARE_SCRIPT, '--legacy', CANONICAL_PATH, '--out', out], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /KV key: data/);
  assert.match(result.stdout, /sessions: not included/);
  const prepared = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(prepared.matches.length, parsed.length);
  assert.equal(prepared.members.length, 12);
  assert.equal(prepared.sessions, undefined);

  const dupFile = path.join(dir, 'dupes.json');
  fs.writeFileSync(dupFile, JSON.stringify([parsed[0], parsed[0]]), 'utf8');
  const duped = spawnSync(process.execPath, [PREPARE_SCRIPT, '--legacy', dupFile, '--out', path.join(dir, 'nope.json')], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.notEqual(duped.status, 0);
  assert.match(`${duped.stderr}${duped.stdout}`, /duplicate/i);
});
