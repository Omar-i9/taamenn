import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { HttpError, drainRequest, json } from './http.mjs';
import { handleRequest } from './routes.mjs';
import { seedLegacyMatchesIfEmpty, store } from './store.mjs';

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      await handleRequest(req, res);
    } catch (error) {
      if (error instanceof HttpError) {
        if (!error.unreadBody) {
          return json(req, res, error.status, { error: error.message });
        }
        // Answer first, then discard what the client is still sending.
        json(req, res, error.status, { error: error.message }, { Connection: 'close' });
        return drainRequest(req);
      }
      // Log server-side, return nothing internal to the client.
      console.error('[taamen] unhandled request error:', error);
      return json(req, res, 500, { error: 'Internal server error.' });
    }
  });
}

export async function start() {
  await store.load();
  await seedLegacyMatchesIfEmpty();
  const server = createServer();
  await new Promise(resolve => server.listen(config.port, resolve));
  console.log(`TAAMEN backend listening on http://localhost:${config.port} (${config.nodeEnv})`);
  return server;
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry && entry === fileURLToPath(import.meta.url)) {
  start().catch(error => {
    console.error('[taamen] failed to start:', error);
    process.exit(1);
  });
}
