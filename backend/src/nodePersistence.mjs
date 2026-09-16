import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { createJsonFile } from './jsonFile.mjs';
import { setStores } from './runtime.mjs';
import { validateData, store } from './store.mjs';
import { validateSessions } from './sessions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let initialized = false;

export function applyNodeFileDefaults() {
  config.dataFile = config.dataFile || path.join(ROOT, 'data.json');
  config.exampleDataFile = config.exampleDataFile || path.join(ROOT, 'data.example.json');
  config.sessionFile = config.sessionFile || path.join(ROOT, 'sessions.json');
  config.legacyFile = config.legacyFile || path.join(ROOT, 'legacy-private-matches.json');
}

async function createFallback() {
  const example = JSON.parse(await fs.readFile(config.exampleDataFile, 'utf8'));
  console.warn('[taamen] data.json is missing; seeding from data.example.json (development fixtures).');
  return example;
}

export function initNodeRuntime() {
  if (initialized) return;
  applyNodeFileDefaults();
  setStores({
    data: createJsonFile({
      file: config.dataFile,
      validate: validateData,
      createFallback,
    }),
    sessions: createJsonFile({
      file: config.sessionFile,
      validate: validateSessions,
      createFallback: async () => ({ records: {} }),
    }),
  });
  initialized = true;
}

/**
 * Historical records live in the operator dataset only. They are seeded once from the
 * controlled legacy snapshot if present, and are never emitted into the frontend.
 */
export async function seedLegacyMatchesIfEmpty() {
  await store.update(async data => {
    if (data.matches.length) return;
    try {
      const legacy = JSON.parse(await fs.readFile(config.legacyFile, 'utf8'));
      if (!Array.isArray(legacy)) return;
      data.matches = legacy.map(match => ({ ...match, visibility: 'PRIVATE' }));
    } catch {
      /* the legacy snapshot is optional */
    }
  });
}
