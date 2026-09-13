import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Serialized, atomic JSON file persistence.
 *
 * Writes are queued so concurrent requests cannot interleave a read-modify-write
 * and lose an update, and each write lands via temp-file rename so a crash cannot
 * leave a truncated file behind.
 */
export function createJsonFile({ file, validate, createFallback }) {
  const tempFile = `${file}.tmp`;
  let state = null;
  let queue = Promise.resolve();

  async function readFromDisk() {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return validate(parsed);
  }

  async function writeToDisk(value) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(tempFile, JSON.stringify(value, null, 2), 'utf8');
    await fs.rename(tempFile, file);
  }

  /** Preserve unreadable data instead of destroying evidence of the corruption. */
  async function quarantine(reason) {
    try {
      await fs.rename(file, `${file}.corrupt-${Date.now()}`);
      console.error(`[taamen] ${path.basename(file)} was unreadable (${reason}); it was preserved with a .corrupt suffix.`);
    } catch {
      /* nothing to preserve */
    }
  }

  async function load() {
    if (state) return state;
    try {
      state = await readFromDisk();
      return state;
    } catch (error) {
      if (error.code !== 'ENOENT') await quarantine(error.message);
      state = validate(await createFallback());
      await writeToDisk(state);
      return state;
    }
  }

  /**
   * Run `mutator` against the in-memory state with exclusive access, then persist.
   * Returns whatever the mutator returns.
   */
  function update(mutator) {
    const run = queue.then(async () => {
      const current = await load();
      const result = await mutator(current);
      await writeToDisk(current);
      return result;
    });
    // Keep the chain alive even when one mutation rejects.
    queue = run.then(() => undefined, () => undefined);
    return run;
  }

  function read(reader) {
    const run = queue.then(async () => reader(await load()));
    queue = run.then(() => undefined, () => undefined);
    return run;
  }

  return { load, read, update };
}
