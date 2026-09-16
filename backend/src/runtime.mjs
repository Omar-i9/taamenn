/**
 * Persistence registry.
 *
 * Node and Worker adapters bind stores before serving requests so the API
 * logic never talks to the filesystem or KV directly.
 */
let dataStore = null;
let sessionStore = null;

export function setStores({ data, sessions }) {
  dataStore = data;
  sessionStore = sessions;
}

export function getDataStore() {
  if (!dataStore) throw new Error('TAAMEN data store is not initialized.');
  return dataStore;
}

export function getSessionStore() {
  if (!sessionStore) throw new Error('TAAMEN session store is not initialized.');
  return sessionStore;
}
