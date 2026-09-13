# Changelog

## Baseline (recorded before the reconstruction)

Measured on Node v24.16.0 / npm 11.15.0, Windows.

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` (`scripts/qa-final.mjs`) | PASS — structural string assertions only, no behavioral coverage |
| `npm run build` | PASS |
| `npm audit` (root) | 0 vulnerabilities |
| `npm audit` (backend) | Not applicable — no lockfile, backend has zero dependencies |
| Lint | No lint script configured |
| Git | No repository existed |

### Security state at baseline

Verified from source and from the built bundle, not from prior audit documents:

- `dist/assets/featuredMembers-*.js` contained all 12 recognition codes and real member names.
- `dist/assets/historicalArchiveRepository-*.js` contained the 24 private historical match records.
- `backend/data.json` was tracked-able (not ignored) and held real names, scrypt salts/digests, and recognition codes.
- `backend/src/server.mjs` and `backend/scripts/provision-members.mjs` hardcoded the real member roster.
- Featured Member verification ran entirely in the browser; `src/services/apiClient.ts` was never imported by the app.
- `scripts/qa-final.mjs` asserted that real member IDs must be present in the frontend.
- Backend sessions were an in-memory map of raw tokens; `data.json` was rewritten on every request without serialization.

### Git history

No git repository existed at baseline, so there is no prior history to search for leaked secrets. The repository was
initialized during this work with `backend/data.json` and the session store ignored from the outset, and the first
commit was made only after all real credential material and private records were removed from source-controlled
files. Private data therefore never entered git history, and no history rewrite was required.

## Reconstruction

### Security

- Historical archive and member recognition became server-authorized (CASE B). No recognition codes, member roster, or
  historical records remain in frontend source or built assets.
- One session-cookie family with a server-side authorization context (`authMethod`, `memberId`, `role`, expiry).
  Session tokens are stored as SHA-256 hashes; raw tokens exist only in the client cookie.
- `authMethod: 'code'` (Featured recognition) can read historical data only. `authMethod: 'password'` (Private Circle)
  reaches Circle resources, and OWNER routes only when the server-side role is OWNER.
- Client-supplied `role`, `authMethod`, `memberId`, `userId`, `ownerId`, `permissions`, and `isOwner` are ignored.
- CSRF protection via a required `X-TAAMEN-Requested` header on cookie-authenticated mutating requests.
- Rate limiting is bounded with expiry sweeping and only trusts forwarded IP headers when `TRUST_PROXY=true`.
- Contact email recipient is fixed server-side; the browser can no longer choose a recipient.
- Security headers applied to all API responses.

### Architecture

- `src/services/apiClient.ts` is the single frontend HTTP layer and is actually used.
- Split API resource boundaries: `/api/private/historical`, `/api/private/circle/*`, `/api/owner/*`.
- JSON persistence is serialized through a write queue with atomic temp-and-rename writes, schema validation, and
  corruption recovery.
- Tactical board drag logic extracted into a pure, tested pointer state machine with one canonical coordinate model.

### Removed

- `src/data/historicalArchive.ts` (private records in the client bundle).
- `src/services/publicData.ts`, `src/infrastructure/storage/localRepository.ts`, `src/core/domain/models.ts` (dead).
- Unused static seed arrays in `src/data/footballData.ts`.
- Hardcoded member rosters in `backend/src/server.mjs` and `backend/scripts/provision-members.mjs`.
