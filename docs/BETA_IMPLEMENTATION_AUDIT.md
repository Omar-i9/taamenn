# TAAMEN 2.0 BETA implementation audit

> **HISTORICAL / ARCHIVE DOCUMENT.** Audit of an earlier three-scope Beta (local / Circle / owner). Not the current product. See `docs/architecture/README.md`.

## Applied

- One TAAMEN shell with three data scopes: public/local, private circle, owner.
- Public local profile remains IndexedDB/local-first.
- Private Circle has a backend boundary, authenticated HttpOnly session cookie in the development server, password hashing, role checks, and protected API endpoints.
- Owner Control Center is server-authorized.
- Match and archive continue to use the same local Match repository/domain.
- Public local upcoming match creation and archive creation added.
- Automatic weekday/date derivation is based on the selected date; weekday is not a separate field.
- Match sharing sanitizes public fields and supports native share/copy fallback plus SVG share-image download.
- Private player/statistics views added using actual legacy aggregate player data only; missing fields remain unavailable/zero only where the source explicitly provides them.
- Tactical board and landscape behavior retained.
- Screenshot wallet remains IndexedDB-based and browser-safe; OS-level screenshot detection is not claimed.
- AI remains lazy-loaded and explicitly experimental.
- EmailJS identifiers are centralized. Verification template ID remains configurable and empty by default.
- AR/EN and RTL/LTR remain supported for the new Beta access/private UI.
- PWA service worker changed to minimal shell precache + runtime caching and excludes `/api/` from blind caching.
- Documentation folders added for architecture, authentication, modes, matches, archive, players, tactical, notifications, AI, email, sharing, PWA, privacy, security and migration.

## Intentionally not fabricated

- No EmailJS verification template ID was invented.
- No official TAAMEN logo asset was fabricated.
- No private member data was invented from public match records.
- No browser/OS screenshot detection claim was added.
- No production cloud database was falsely represented as present. The included backend is a development Node boundary with file persistence; production deployment should replace that persistence layer with a managed database and production auth infrastructure.

## Validation

- Backend JavaScript syntax checked with `node --check`.
- Full frontend typecheck/build could not be executed in this isolated environment because npm package downloads were unavailable and the previous native `node_modules` tree was intentionally excluded from the deliverable. Source remains dependency-defined through `package.json`/lockfile.
