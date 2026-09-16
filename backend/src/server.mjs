import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.mjs';
import { HttpError, jsonResponse } from './http.mjs';
import { drainRequest, nodeClientIp, nodeEncrypted, nodeToFetchRequest, sendNodeResponse } from './nodeHttp.mjs';
import { handleFetch } from './routes.mjs';
import { contactConfigured } from './contact.mjs';
import { syncFeaturedMembers } from './featuredMembers.mjs';
import { store } from './store.mjs';
import { initNodeRuntime, seedLegacyMatchesIfEmpty } from './nodePersistence.mjs';

initNodeRuntime();

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const request = await nodeToFetchRequest(req);
      const response = await handleFetch(request, {
        ip: nodeClientIp(req),
        encrypted: nodeEncrypted(req),
      });
      await sendNodeResponse(res, response);
    } catch (error) {
      if (error instanceof HttpError) {
        const fallback = jsonResponse(
          new Request(`http://${req.headers.host || 'localhost'}${req.url || '/'}`),
          error.status,
          { error: error.message },
          error.unreadBody ? { Connection: 'close' } : {},
        );
        if (!error.unreadBody) {
          return sendNodeResponse(res, fallback);
        }
        // Answer first, then discard what the client is still sending.
        await sendNodeResponse(res, fallback);
        return drainRequest(req);
      }
      // Log server-side, return nothing internal to the client.
      console.error('[taamen] unhandled request error:', error);
      const fallback = jsonResponse(
        new Request(`http://${req.headers.host || 'localhost'}${req.url || '/'}`),
        500,
        { error: 'Internal server error.' },
      );
      return sendNodeResponse(res, fallback);
    }
  });
}

export async function start() {
  await store.load();
  await store.update(data => { syncFeaturedMembers(data); });
  await seedLegacyMatchesIfEmpty();
  const server = createServer();
  await new Promise(resolve => server.listen(config.port, resolve));
  console.log(`TAAMEN backend listening on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`[taamen] contact email ${contactConfigured() ? 'configured' : 'not configured'}`);
  return server;
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entry && entry === fileURLToPath(import.meta.url)) {
  start().catch(error => {
    console.error('[taamen] failed to start:', error);
    process.exit(1);
  });
}
