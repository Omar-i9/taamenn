/**
 * KV-backed JSON document with the same load/read/update contract as jsonFile.
 *
 * Writes are queued so concurrent requests cannot interleave a read-modify-write.
 */
export function createKvJsonFile({ kv, key, validate, createFallback }) {
  let state = null;
  let queue = Promise.resolve();

  async function load() {
    if (state) return state;
    const raw = await kv.get(key, { type: 'text' });
    if (raw) {
      try {
        state = validate(JSON.parse(raw));
        return state;
      } catch (error) {
        console.error(`[taamen] KV key "${key}" was unreadable (${error.message}); using fallback.`);
      }
    }
    state = validate(await createFallback());
    await kv.put(key, JSON.stringify(state));
    return state;
  }

  async function persist() {
    await kv.put(key, JSON.stringify(state));
  }

  function update(mutator) {
    const run = queue.then(async () => {
      const current = await load();
      const result = await mutator(current);
      await persist();
      return result;
    });
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
