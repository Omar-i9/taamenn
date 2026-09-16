import { FEATURED_MEMBERS, syncFeaturedMembers } from './featuredMembers.mjs';
import { validateData } from './store.mjs';

export const CANONICAL_LEGACY_RELATIVE_PATH = 'backend/legacy-private-matches.json';

const SECRET_KEYS = new Set([
  'password', 'passwordHash', 'salt', 'digest', 'accessToken',
  'EMAILJS_PRIVATE_KEY', 'emailjsPrivateKey', 'sessionToken', 'token',
]);

const DEMO_MATCH_IDS = new Set(['DEV-001', 'DEV-002']);

const CANONICAL_REQUIRED_FIELDS = [
  'id', 'type', 'team1', 'team2', 'score1', 'score2', 'status', 'dateLabel', 'dateKey',
];

export function isDemoMatch(match) {
  if (!match || typeof match !== 'object') return true;
  if (DEMO_MATCH_IDS.has(String(match.id || ''))) return true;
  const story = String(match.story || '');
  if (/development fixture/i.test(story)) return true;
  if (String(match.id || '').startsWith('DEV-')) return true;
  return false;
}

function stripSecrets(value) {
  if (Array.isArray(value)) return value.map(stripSecrets);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEYS.has(key)) continue;
    out[key] = stripSecrets(child);
  }
  return out;
}

function asMatchList(input) {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object' && Array.isArray(input.matches)) return input.matches;
  return [];
}

/**
 * Keep identity and chronology. Drop secrets. Do not invent stadium/city/time.
 * Unknown extra fields are kept only when they are not secret-shaped.
 */
export function normalizeMatch(match) {
  if (!match || typeof match !== 'object' || Array.isArray(match)) return null;
  const cleaned = stripSecrets(match);
  if (typeof cleaned.id !== 'string' || !cleaned.id) return null;
  cleaned.visibility = 'PRIVATE';
  if (cleaned.source === 'legacy-taamenn') cleaned.source = 'legacy-taamenn';
  else if (!cleaned.source) cleaned.source = 'legacy';
  return cleaned;
}

export function canonicalRecordIssues(match) {
  const issues = [];
  if (!match || typeof match !== 'object' || Array.isArray(match)) return ['not-object'];
  for (const field of CANONICAL_REQUIRED_FIELDS) {
    if (match[field] === undefined || match[field] === null || match[field] === '') {
      issues.push(`missing:${field}`);
    }
  }
  if (typeof match.id !== 'string') issues.push('type:id');
  if (typeof match.score1 !== 'number' || Number.isNaN(match.score1)) issues.push('type:score1');
  if (typeof match.score2 !== 'number' || Number.isNaN(match.score2)) issues.push('type:score2');
  if (typeof match.dateKey !== 'number' || Number.isNaN(match.dateKey)) issues.push('type:dateKey');
  for (const key of Object.keys(match)) {
    if (SECRET_KEYS.has(key)) issues.push(`secret:${key}`);
  }
  return [...new Set(issues)];
}

/**
 * Inspect a canonical historical snapshot without mutating it.
 * Duplicate IDs and schema errors are reported; records are not invented.
 */
export function inspectCanonicalSource(input) {
  if (input == null) {
    return {
      ok: false,
      error: 'missing',
      matches: [],
      duplicateIds: [],
      invalid: [],
      inputCount: 0,
      uniqueCount: 0,
    };
  }
  if (!Array.isArray(input) && !(input && typeof input === 'object' && Array.isArray(input.matches))) {
    return {
      ok: false,
      error: 'not-array',
      matches: [],
      duplicateIds: [],
      invalid: [],
      inputCount: 0,
      uniqueCount: 0,
    };
  }
  const list = asMatchList(input);
  const seen = new Map();
  const duplicateIds = [];
  const invalid = [];
  for (const [index, raw] of list.entries()) {
    const issues = canonicalRecordIssues(raw);
    const match = normalizeMatch(raw);
    if (issues.length || !match) {
      invalid.push({ index, id: raw?.id ?? null, issues: issues.length ? issues : ['invalid-schema'] });
      continue;
    }
    if (seen.has(match.id)) {
      duplicateIds.push(match.id);
      continue;
    }
    seen.set(match.id, match);
  }
  const error = invalid.length ? 'invalid-schema' : duplicateIds.length ? 'duplicate-ids' : null;
  return {
    ok: !error,
    error,
    matches: [...seen.values()],
    duplicateIds,
    invalid,
    inputCount: list.length,
    uniqueCount: seen.size,
  };
}

export function emptyProductionDataset() {
  return {
    schemaVersion: 1,
    members: [],
    players: [],
    matches: [],
    notifications: [],
    performance: [],
    invitations: [],
    audit: [],
    tacticalPlan: null,
  };
}

/**
 * Build the KV `data` document. Sessions are never included.
 * Featured Members are always the canonical 12 from source, not a client copy.
 */
export function prepareKvDocument({ source, legacyMatches, includeDemo = false } = {}) {
  const data = emptyProductionDataset();
  const byId = new Map();

  function ingest(matches, origin) {
    const added = [];
    const skippedDemo = [];
    const skippedDuplicate = [];
    const skippedInvalid = [];
    for (const raw of asMatchList(matches)) {
      const match = normalizeMatch(raw);
      if (!match) {
        skippedInvalid.push(raw?.id || origin);
        continue;
      }
      if (!includeDemo && isDemoMatch(match)) {
        skippedDemo.push(match.id);
        continue;
      }
      if (byId.has(match.id)) {
        skippedDuplicate.push(match.id);
        continue;
      }
      byId.set(match.id, match);
      added.push(match.id);
    }
    return { added, skippedDemo, skippedDuplicate, skippedInvalid };
  }

  const fromSource = ingest(source, 'source');
  const fromLegacy = ingest(legacyMatches, 'legacy');

  data.matches = [...byId.values()].sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0));
  syncFeaturedMembers(data);

  const validated = validateData(data);
  // validateData does not drop extra match fields; re-apply featured sync after repair.
  syncFeaturedMembers(validated);

  const inputMatchCount = asMatchList(source).filter(item => !isDemoMatch(item) || includeDemo).length
    + asMatchList(legacyMatches).length;
  const uniqueInputIds = new Set([
    ...asMatchList(source).map(item => item?.id).filter(Boolean),
    ...asMatchList(legacyMatches).map(item => item?.id).filter(Boolean),
  ]);

  const report = {
    featuredMembers: validated.members.length,
    featuredIds: validated.members.map(member => member.id),
    matches: validated.matches.length,
    matchIds: validated.matches.map(match => match.id),
    fromSource,
    fromLegacy,
    secretsStripped: true,
    sessionsIncluded: false,
    demoIncluded: includeDemo,
    kvKey: 'data',
    recordsLost: validated.matches.length !== fromSource.added.length + fromLegacy.added.length,
    preMigrationCount: fromSource.added.length + fromLegacy.added.length + fromSource.skippedDuplicate.length + fromLegacy.skippedDuplicate.length,
    postMigrationCount: validated.matches.length,
    uniqueInputIds: uniqueInputIds.size,
    inputMatchCount,
  };

  return { data: validated, report };
}

export function classifyLocalFile(name, stats) {
  if (name === 'sessions.json') return 'D';
  if (name === '.env' || name.endsWith('.env')) return 'D';
  if (name === 'data.example.json') return 'B';
  if (name === 'legacy-private-matches.json') return stats?.matchCount ? 'A' : 'A';
  if (name === 'data.json') return 'mixed';
  return 'C';
}

export { FEATURED_MEMBERS };
