import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareEnvironment, seedDataset, writeDataset } from './helpers.mjs';

const dir = prepareEnvironment('persistence');

const { hashPassword } = await import('../src/passwords.mjs');
writeDataset(seedDataset(hashPassword));

const { createJsonFile } = await import('../src/jsonFile.mjs');
const { store, validateData } = await import('../src/store.mjs');

test('concurrent updates are serialized and none are lost', async () => {
  await store.load();
  const before = await store.read(data => data.audit.length);

  // Without serialization these interleaving read-modify-write cycles would
  // overwrite each other and only a fraction of the entries would survive.
  await Promise.all(
    Array.from({ length: 40 }, (_, index) =>
      store.update(data => { data.audit.push({ action: `CONCURRENT_${index}`, timestamp: Date.now() }); })
    )
  );

  const after = await store.read(data => data.audit.length);
  assert.equal(after, before + 40);

  const onDisk = JSON.parse(fs.readFileSync(process.env.TAAMEN_DATA_FILE, 'utf8'));
  assert.equal(onDisk.audit.length, after, 'the file must match in-memory state');
});

test('writes are atomic: no temp file survives and the file always parses', async () => {
  await Promise.all(Array.from({ length: 15 }, () => store.update(data => { data.audit.push({ action: 'ATOMIC' }); })));
  assert.equal(fs.existsSync(`${process.env.TAAMEN_DATA_FILE}.tmp`), false, 'the temp file must be renamed away');
  const text = fs.readFileSync(process.env.TAAMEN_DATA_FILE, 'utf8');
  assert.doesNotThrow(() => JSON.parse(text));
});

test('a failing mutation does not stall later writes', async () => {
  await assert.rejects(store.update(() => { throw new Error('intentional failure'); }), /intentional failure/);
  await store.update(data => { data.audit.push({ action: 'AFTER_FAILURE' }); });
  const actions = await store.read(data => data.audit.map(entry => entry.action));
  assert.ok(actions.includes('AFTER_FAILURE'), 'the write queue must recover from a rejected mutation');
});

test('validation repairs a malformed dataset instead of trusting it', () => {
  const repaired = validateData({
    members: [
      { id: 'ok', username: 'ok', displayName: 'Ok', role: 'MEMBER' },
      { id: 'featured', username: 'omar', displayName: 'Omar', role: 'FEATURED_MEMBER' },
      { id: 'ok', username: 'duplicate', displayName: 'Duplicate', role: 'MEMBER' },
      { id: 'bad-role', username: 'bad', displayName: 'Bad', role: 'SUPERUSER' },
      { username: 'no-id', displayName: 'No id', role: 'MEMBER' },
      'not-an-object',
    ],
    matches: 'not-an-array',
    tacticalPlan: 'not-an-object',
  });

  assert.equal(repaired.members.length, 2, 'duplicate ids and invalid roles are dropped');
  assert.equal(repaired.members[0].id, 'ok');
  assert.equal(repaired.members[1].role, 'FEATURED_MEMBER');
  assert.deepEqual(repaired.matches, []);
  assert.equal(repaired.tacticalPlan, null);
  assert.equal(repaired.schemaVersion, 1);
  // Collections always exist so callers never guard against undefined.
  for (const key of ['players', 'notifications', 'performance', 'invitations', 'audit']) {
    assert.ok(Array.isArray(repaired[key]), `${key} must be an array`);
  }
});

test('a corrupt file is preserved and replaced rather than silently truncated', async () => {
  const file = `${dir}/corrupt.json`;
  fs.writeFileSync(file, '{ this is not json', 'utf8');

  const recovered = createJsonFile({
    file,
    validate: input => ({ items: Array.isArray(input?.items) ? input.items : [] }),
    createFallback: async () => ({ items: ['fallback'] }),
  });

  const state = await recovered.load();
  assert.deepEqual(state.items, ['fallback'], 'the fallback dataset is used');
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).items, ['fallback']);

  const quarantined = fs.readdirSync(dir).filter(name => name.startsWith('corrupt.json.corrupt-'));
  assert.equal(quarantined.length, 1, 'the unreadable file must be kept for inspection');
  assert.equal(fs.readFileSync(`${dir}/${quarantined[0]}`, 'utf8'), '{ this is not json');
});

test('a missing file is created from the fallback without error', async () => {
  const file = `${dir}/absent.json`;
  const created = createJsonFile({
    file,
    validate: input => ({ items: Array.isArray(input?.items) ? input.items : [] }),
    createFallback: async () => ({ items: ['seeded'] }),
  });
  const state = await created.load();
  assert.deepEqual(state.items, ['seeded']);
  assert.ok(fs.existsSync(file));
  assert.equal(fs.readdirSync(dir).filter(name => name.startsWith('absent.json.corrupt-')).length, 0,
    'a missing file is not a corruption event');
});
