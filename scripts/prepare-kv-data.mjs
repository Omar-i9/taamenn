#!/usr/bin/env node
/**
 * Prepare a validated Cloudflare KV `data` document from reviewed sources.
 *
 * Does NOT upload. Does NOT read backend/data.json unless you pass --source.
 * Never includes sessions or environment secrets.
 *
 *   node scripts/prepare-kv-data.mjs
 *   node scripts/prepare-kv-data.mjs --legacy backend/legacy-private-matches.json
 *   node scripts/prepare-kv-data.mjs --source backend/data.json --legacy backend/legacy-private-matches.json
 *
 * After a real TAAMEN_KV namespace exists, the operator uploads once:
 *   npx wrangler kv key put data --binding TAAMEN_KV --path backend/kv-data.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareKvDocument } from '../backend/src/kvMigration.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function readJson(file) {
  if (!file) return null;
  const resolved = path.isAbsolute(file) ? file : path.join(root, file);
  if (!fs.existsSync(resolved)) return { missing: resolved };
  return { value: JSON.parse(fs.readFileSync(resolved, 'utf8')), path: resolved };
}

const includeDemo = process.argv.includes('--include-demo');
const sourceArg = arg('--source', '');
const legacyArg = arg('--legacy', 'backend/legacy-private-matches.json');
const outArg = arg('--out', 'backend/kv-data.json');

const sourceRead = sourceArg ? readJson(sourceArg) : null;
if (sourceRead?.missing) {
  console.error(`--source not found: ${sourceRead.missing}`);
  process.exit(1);
}

const legacyRead = readJson(legacyArg);
const legacyMatches = legacyRead?.missing ? null : legacyRead.value;
if (legacyRead?.missing && process.argv.includes('--legacy')) {
  console.error(`--legacy not found: ${legacyRead.missing}`);
  process.exit(1);
}

const { data, report } = prepareKvDocument({
  source: sourceRead?.value,
  legacyMatches: Array.isArray(legacyMatches) ? legacyMatches : legacyMatches?.matches,
  includeDemo,
});

const outPath = path.isAbsolute(outArg) ? outArg : path.join(root, outArg);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

console.log('TAAMEN KV data document prepared (not uploaded).');
console.log(`  output: ${path.relative(root, outPath)}`);
console.log(`  Featured Members: ${report.featuredMembers} (must be 12)`);
console.log(`  historical matches: ${report.matches}`);
if (report.matchIds.length) console.log(`  match ids: ${report.matchIds.join(', ')}`);
console.log(`  source ingest: added ${report.fromSource.added.length}, demo skipped ${report.fromSource.skippedDemo.length}, dupes ${report.fromSource.skippedDuplicate.length}`);
console.log(`  legacy ingest: added ${report.fromLegacy.added.length}, demo skipped ${report.fromLegacy.skippedDemo.length}, dupes ${report.fromLegacy.skippedDuplicate.length}`);
console.log('  sessions: not included');
console.log('  secrets: stripped');

if (!sourceArg) {
  console.log('  classification: backend/data.json was NOT read (pass --source to review an operator dataset).');
}
if (legacyRead?.missing) {
  console.warn('  classification A BLOCKED: backend/legacy-private-matches.json is absent on this machine.');
  console.warn('  Production Featured Historical Archive will be empty until that gitignored snapshot is provided.');
}
if (report.featuredMembers !== 12) {
  console.error('Featured Member count is not 12.');
  process.exit(1);
}
if (report.matches === 0) {
  console.warn('  0 historical matches in the prepared document.');
  process.exit(0);
}
