# Deployment

TAAMEN 2.0 is a Vite-built static SPA plus a dependency-free Node HTTP API. This document
describes how to run both and what each hosting topology demands. **No topology is assumed.**
Choose one, then configure cookies and CORS to match it.

## Processes

| Process | Command | Default |
|---|---|---|
| Frontend dev server | `npm run dev` | `http://localhost:5173` |
| Backend API | `npm run backend` | `http://localhost:8787` |
| Production build | `npm run build` | Vite SPA in `dist/client/` plus the Worker bundle |
| Cloudflare local runtime | `npm run preview` | built Worker + assets (after `npm run build`) |

The backend has no npm dependencies and no build step. It requires Node 20 or newer
(`--env-file-if-exists`, `getSetCookie`, native `fetch`).

## Development

`vite.config.ts` proxies `/api` to the backend, so the browser sees one origin and the
session cookie is first-party — the same conditions as a same-origin production deployment.
Override the target with `TAAMEN_BACKEND_ORIGIN` if the backend runs elsewhere.

This proxy is a **development convenience**. It does not imply that production must serve
`dist/` from the Node backend, and the local Node server deliberately does not serve static
files. Production on Cloudflare is same-origin: the Worker serves the SPA and `/api/*`.

## Choosing a production topology

Evaluate the real deployment against these three cases before configuring anything.

### 1. Same-origin (recommended)

The production target is `https://taamenn.com` on a Cloudflare Worker: the Vite SPA and
`/api/*` share one origin. Local development still uses `npm run backend` on
`http://localhost:8787` and does not require Cloudflare.

The app and the API answer on one origin, for example `https://taamenn.com` serving the
SPA and `https://taamenn.com/api/*` reaching Worker application logic.

- CORS: not needed. Set `CORS_ORIGIN=` (empty).
- Cookie: `HttpOnly; SameSite=Lax; Path=/; Secure`.
- CSRF: the `X-TAAMEN-Requested` header requirement is sufficient, because a cross-site
  form or image cannot set a custom header.
- Set `REQUIRE_HTTPS=true` and `TRUST_PROXY=true` (the proxy terminates TLS).

### 2. Same-site, different subdomains

For example `https://app.taamen.example` and `https://api.taamen.example`. These are
cross-**origin** but same-**site**, because the registrable domain matches.

- CORS: `CORS_ORIGIN=https://app.taamen.example`. The API echoes only allow-listed origins
  and sends `Access-Control-Allow-Credentials: true`.
- Cookie: `SameSite=Lax` still works, because same-site is evaluated on the registrable
  domain. Requests are credentialed and preflighted.
- Verify in a real browser that the cookie is both set and returned. Third-party cookie
  restrictions do not apply here, but tracking-prevention heuristics evolve.

### 3. Cross-site

For example `https://taamen.pages.dev` and `https://api.taamen.example`. Avoid this.

A cross-site cookie requires `SameSite=None; Secure`, which browsers increasingly block as
third-party. If this topology is unavoidable, the session must move to an `Authorization`
header with a token held in memory, and the CSRF story changes accordingly. That work is
**not implemented**; do not deploy cross-site and assume the current cookie flow works.

## Backend configuration

Copy `backend/.env.example` to `backend/.env`. Worker preview uses `.dev.vars` at the
repo root. See `docs/SECURITY.md` and `docs/email/CONFIGURATION.md`.

| Variable | Purpose |
|---|---|
| `PORT` | Listen port. Default `8787`. |
| `NODE_ENV` | `production` forces the `Secure` cookie attribute. |
| `SESSION_TTL_MS` | Session lifetime. Minimum 15 minutes. |
| `CORS_ORIGIN` | Comma-separated allow-list. Empty for same-origin. |
| `REQUIRE_HTTPS` | Reject plain HTTP with 426. |
| `TRUST_PROXY` | Honour `X-Forwarded-For` / `X-Forwarded-Proto`. |
| `TAAMEN_SUPPORT_RECIPIENT` | Contact destination. Server-owned. Never commit the real address. |
| `EMAILJS_SERVICE_ID` | `service_13mkb9h` |
| `EMAILJS_CONTACT_TEMPLATE_ID` | `template_jsugxta` |
| `EMAILJS_AUTOREPLY_TEMPLATE_ID` | `template_4pj4xlm` |
| `EMAILJS_PUBLIC_KEY` | `7xyuge5ZLIgBevcbL` |
| `EMAILJS_PRIVATE_KEY` | Server-only. Required if EmailJS “Use Private Key” is enabled. Never `VITE_*`. |

`TRUST_PROXY` must be `false` unless a proxy genuinely overwrites those headers. With it
enabled behind nothing, any client can spoof its address and reset its rate-limit budget.

## Cloudflare Workers

`wrangler.jsonc` and `@cloudflare/vite-plugin` produce the production bundle. `npm run dev`
does not start Miniflare. Use `npm run preview` after `npm run build` to exercise the
Workers runtime locally.

- Worker entry: `worker/index.js` — `/api/*` only (`assets.run_worker_first`).
- Wrangler CLI assets directory: `dist/client` (Vite client outDir after `npm run build`).
  `npx wrangler dev --remote` reads `wrangler.jsonc` and needs this field. `npm run preview`
  still uses the Vite plugin’s generated `dist/taamenn/wrangler.json`.
- Shared API logic: `backend/src/routes.mjs` `handleFetch`.
- Node adapter: `backend/src/server.mjs` (unchanged command: `npm run backend`).
- Persistence: local Node uses `backend/data.json` / `backend/sessions.json`; the Worker
  uses the `TAAMEN_KV` KV namespace (binding name `TAAMEN_KV`, keys `data` and `sessions`).
- Copy `.dev.vars.example` to `.dev.vars` for local Worker secrets. Never commit it.
- `EMAILJS_PRIVATE_KEY` and `TAAMEN_SUPPORT_RECIPIENT` stay off the frontend and off
  `VITE_*`. Public EmailJS identifiers may live in Wrangler `vars`; private values do not.
- Do not put operator `data.json` in `dist/client/` or `public/`.

### KV namespace

`wrangler.jsonc` binds the existing Cloudflare namespace. Do not create another one.

```jsonc
"kv_namespaces": [{ "binding": "TAAMEN_KV", "id": "7698f62403814e81b6f2ca13a8eb9cbc" }]
```

Local `vite preview` still uses Miniflare. Worker logical keys remain `data` and `sessions`.

### Historical data migration (not uploaded automatically)

Featured Members (exactly 12) live in `backend/src/featuredMembers.mjs` and are synced
on Worker boot. They are not copied into the client bundle.

The canonical historical snapshot is **tracked** at `backend/legacy-private-matches.json`.
It is the authoritative source. `backend/data.example.json` DEV-001/DEV-002 records
are seed/demo and are not migrated by default. Sessions and `.env` values must never
be migrated.

```bash
npm run kv:prepare -- --legacy backend/legacy-private-matches.json
# writes backend/kv-data.json (gitignored). Review it, then after the KV id exists:
# npx wrangler kv key put data --binding TAAMEN_KV --path backend/kv-data.json
```

`npm run kv:prepare` validates the snapshot (array, unique IDs, required fields),
preserves record IDs / dates / scores / status / stories / optional `details`,
adds `source: legacy` and `visibility: PRIVATE` when missing, strips secret-shaped
keys, and refuses to write a document if records would be dropped or duplicated.
The output is the Worker KV `data` key. The `sessions` key stays empty until live
Featured sessions are created at runtime.

`TAAMEN_SEED_EXAMPLE` must be unset/false in production so first boot does not seed
demo fixtures into KV.

### Production variables

Same-origin at `https://taamenn.com` / `https://taamenn.com/api/*`. Set
`CORS_ORIGIN` to empty (already in Wrangler `vars`) — no wildcard CORS.

Local Worker preview and default `npm run build` keep top-level
`REQUIRE_HTTPS=false` so `http://localhost` preview works. `NODE_ENV` is unset
at the top level; `backend/src/config.mjs` defaults it to `development`. Local
Node (`npm run backend`, `npm run dev`) still uses `backend/.env` /
`backend/.env.example` and does not read Wrangler env blocks.

Production values live in `wrangler.jsonc` `env.production` (`REQUIRE_HTTPS=true`,
`NODE_ENV=production`). The Cloudflare Vite plugin selects that environment at
**build** time. Do not flip the top-level preview defaults. Do not attach
`taamenn.com` in this step.

```bash
npm run build:production   # cross-env CLOUDFLARE_ENV=production vite build (Windows + Unix)
npx wrangler deploy        # uses the flattened dist/taamenn/wrangler.json
```

`vars` and `kv_namespaces` are non-inheritable in Wrangler; `env.production`
repeats the same KV id and EmailJS public IDs. The production Worker name stays
`taamenn` (not `taamenn-production`). Session cookies get `Secure` when the
request is HTTPS; `REQUIRE_HTTPS=true` rejects plain HTTP with 426.

EmailJS `Origin` for the Worker is `https://taamenn.com` (`EMAILJS_ORIGIN`). Add that
origin in the EmailJS dashboard (or enable non-browser API). Local Node still uses
`http://localhost` unless overridden.

Secrets (never commit, never Wrangler `vars`, never `VITE_*`):

| Secret | Required? | Where to enter |
|---|---|---|
| `TAAMEN_SUPPORT_RECIPIENT` | Optional if the EmailJS Contact template To field is already set; otherwise set it | Cloudflare Worker secret on `taamenn`; also `backend/.env` for Node |
| `EMAILJS_PRIVATE_KEY` | Only if EmailJS Account → Security has “Use Private Key” enabled | Cloudflare Worker secret on `taamenn` |

Remaining before first production deploy:

1. Confirm dashboard secrets (`TAAMEN_SUPPORT_RECIPIENT` if the template To field is not set; `EMAILJS_PRIVATE_KEY` only if required).
2. `npm run build:production` then `npx wrangler deploy` (do not attach `taamenn.com` in this phase).

## Operator data

These files hold real member and match data. They must never be served as static
assets or placed inside `dist/client/` or `public/`:

- `backend/data.json` — gitignored local Node operator dataset
- `backend/sessions.json` — gitignored hashed session tokens
- `backend/legacy-private-matches.json` — **tracked** canonical historical snapshot
- `backend/kv-data.json` — gitignored prepared KV `data` document (`npm run kv:prepare`)

On first start, if `data.json` is absent the backend seeds from `backend/data.example.json`,
then `start()` replaces the member collection with the canonical 12 Featured Members
(identifiers only; no passwords). A production host still must keep `data.json` off the
client bundle and out of git.

Back up `backend/data.json` with ordinary file backups. Restoring is a file copy; the
backend validates and repairs the dataset on load and quarantines an unreadable file as
`data.json.corrupt-<timestamp>` rather than overwriting it.

## Frontend configuration

`VITE_API_BASE_URL` defaults to `/api`, which is correct for same-origin and for the dev
proxy. Set it to the absolute API origin only for topology 2, and configure `CORS_ORIGIN`
on the backend to match.

## Static hosting headers

The backend sets security headers on its own responses. Static asset responses come from
whatever serves `dist/`, so configure these there:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` with `frame-ancestors 'none'`
- `Strict-Transport-Security` — only over HTTPS

A restrictive CSP `default-src 'none'` suits the API but would break the SPA, which needs
`script-src 'self'`, `style-src 'self' 'unsafe-inline'` for inline SVG icon styling, and
`img-src 'self' data:` for avatar and banner data URLs. See `docs/SECURITY.md`.

`public/404.html` is a static-host fallback: it stores the original URL and
redirects to `/` so the SPA can restore `/share/...` and `/acquisition`. Cloudflare
Workers use `not_found_handling: single-page-application` (index.html) instead.

## Service worker

`public/sw.js` never caches `/api/*`, so no authenticated response can be replayed to a
different session. The cache version is `v7`; bump it whenever cached shell behaviour
changes, otherwise an installed worker can keep serving an obsolete bundle.

Share routes (`/share/*`) and `/acquisition` are fetched network-first and are not
written into the runtime cache. Offline they fall back to the cached `/` shell so
React can still read the current pathname. `public/404.html` stores the original
URL in `sessionStorage` (`taamen-spa-path`) and replaces to `/`; `src/main.tsx`
restores that path before React boots. Cloudflare production uses SPA
`not_found_handling` and serves `index.html` for those routes, so 404.html is the
static-host fallback only.
