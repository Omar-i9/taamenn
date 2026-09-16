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

Copy `backend/.env.example` to `backend/.env`. See `docs/SECURITY.md` for the security
meaning of each value.

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
- Shared API logic: `backend/src/routes.mjs` `handleFetch`.
- Node adapter: `backend/src/server.mjs` (unchanged command: `npm run backend`).
- Persistence: local Node uses `backend/data.json` / `backend/sessions.json`; the Worker
  uses the `TAAMEN_KV` KV namespace. Replace the placeholder KV ids before a real deploy.
- Copy `.dev.vars.example` to `.dev.vars` for local Worker secrets. Never commit it.
- `EMAILJS_PRIVATE_KEY` and `TAAMEN_SUPPORT_RECIPIENT` stay off the frontend and off
  `VITE_*`. Public EmailJS identifiers may live in Wrangler `vars`; private values do not.
- Do not put operator `data.json` in `dist/client/` or `public/`.

This repository is prepared for Cloudflare deployment. Publishing to production and
changing the Cloudflare dashboard are a later phase.

## Operator data

These files hold real member and match data. They are gitignored and must never be served
as static assets or placed inside `dist/` or `public/`:

- `backend/data.json` — members, password hashes, recognition codes, private matches
- `backend/sessions.json` — hashed session tokens
- `backend/legacy-private-matches.json` — historical snapshot used to seed `data.json`

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

`public/404.html` supports SPA hash routing on static hosts that fall back to it.

## Service worker

`public/sw.js` never caches `/api/*`, so no authenticated response can be replayed to a
different session. The cache version is `v6`; bump it whenever cached shell behaviour
changes, otherwise an installed worker can keep serving an obsolete bundle.
