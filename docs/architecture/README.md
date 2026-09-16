# TAAMEN 2.0 Beta Architecture

> Current product architecture. Older Circle/password-workspace documents in this repo are historical archives, not this model.

TAAMEN is a **local-first** football workspace:

- The ordinary user has a local profile, local matches, local archive, local tactical plans, local notifications, and local export/import. No account is required.
- Featured Member recognition is optional. A server `code` session opens a **read-only Historical Record**. It is not a password workspace and not a second Match database.
- Support contact posts to `POST /api/public/contact`. EmailJS credentials stay on the backend.

There is no Private Circle product surface (no Circle UI, login, owner console, or Circle match APIs).

## Match domain

Match Center and Archive use the same canonical `Match` model and repository.

`UPCOMING → ACTIVE → COMPLETED_PENDING_RESULT → COMPLETED_WITH_RESULT → ARCHIVED`

Archive is a projection of canonical matches. Historical Record is independent featured/legacy data.

## Storage strategy

Public storage is IndexedDB first (`taamen-2`). Sharing is explicit local payload exchange, not cloud sync.

The canonical Featured historical snapshot is `backend/legacy-private-matches.json` (tracked).
`npm run kv:prepare` builds the Worker KV `data` document from that file. Sessions persist
under a separate KV key (`sessions`) on the `TAAMEN_KV` binding. The snapshot is not part
of the frontend bundle.

## Data isolation

Public pages must never fetch legacy private history, recognition codes, or operator member credentials. Share payloads must not include email, phone, avatar, or unrelated workspace data.

## Navigation

`src/config/routes.ts` is the source of truth for route metadata. Desktop and mobile navigation derive from the registry.

## Images

The official TAAMEN brand mark is `public/assets/taamen-brand-mark.png`, referenced through `src/config/branding.ts`. Its SHA-256 is asserted by `scripts/qa-final.mjs`. Profile images are resized/compressed before local storage.

## Future cloud sync

When cloud storage is introduced, keep local writes immediate and treat remote synchronization as a separate state machine. Do not make cloud availability a prerequisite for using the local workspace.
