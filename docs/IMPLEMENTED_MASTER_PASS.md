# Implemented Master Pass — Beta

> **HISTORICAL / ARCHIVE DOCUMENT.** Implementation notes from an earlier pass that still included Private Circle. Not the current product. See `docs/architecture/README.md`.

This build applies the master UI/UX and architecture direction while preserving the existing TAAMEN 2.0 Beta structure.

Implemented highlights:

- supplied TAAMEN brand mark is centralized and used in the app shell, access screen, favicon, manifest and loading state;
- public and private navigation are derived from one route registry;
- mobile navigation exposes primary routes plus a More bottom sheet;
- public Profile is a standalone page with avatar/banner upload, local image processing and public-safe sharing;
- Settings is no longer a profile editor and now contains local preferences, email verification/connection, storage and screenshot wallet;
- public users can create, edit, finish and delete matches locally, with LOCAL/PUBLIC visibility and a unified match lifecycle;
- Archive continues to consume the same Match domain;
- Tactical now has a stronger 5v5 field geometry, below-pitch operations panel, pointer dragging, formation state, undo/redo and a tactical focus mode;
- Private Circle uses eight named members and no longer relies on one shared Circle Password;
- secure per-member password provisioning is available through `npm run provision:members` in `backend`;
- backend authentication uses per-member scrypt hashes, HttpOnly sessions, rate limiting and owner-only member credential/status management;
- public mode never fetches private legacy records;
- public/local storage remains IndexedDB-first and the repository layer is documented as the seam for future cloud sync;
- feature-level error boundaries and loading/empty states were strengthened;
- package versions were pinned to the versions represented by the existing lockfile instead of `latest`.

## Verification notes

Static syntax checks for TypeScript/TSX (using TypeScript no-check parsing), backend JavaScript syntax, and JSON validity passed.

A full dependency install/build was not reproducible in this environment because the uploaded working tree did not contain complete installed type-package contents and the environment could not fetch the missing npm tarballs. Do a normal `npm ci` in a network-enabled development environment, then run `npm run typecheck` and `npm run build`.
