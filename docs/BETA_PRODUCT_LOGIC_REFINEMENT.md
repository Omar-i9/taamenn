# TAAMEN 2.0 Beta — Product Logic Refinement

> **HISTORICAL / ARCHIVE DOCUMENT.** Describes an earlier Public/Circle/Owner split. It is **not** the current product. See `docs/architecture/README.md`.

## Scopes
- PUBLIC / LOCAL: IndexedDB-backed local workspace; no cloud account required.
- PRIVATE CIRCLE: backend-authoritative shared data; Beta uses one shared Circle Password and an authorized member name.
- OWNER / ADMIN: same shell, server-authorized elevated scope.

## Public isolation
Legacy internal history is not seeded into public IndexedDB. Public Home, Match Center, Archive and Tactical use only LOCAL/PUBLIC records. Public tactical defaults use generic Player 1–5 labels and sanitize known legacy private names.

## Private history
`backend/legacy-private-matches.json` contains the actual legacy Match archive converted to PRIVATE visibility. The backend imports it when its private match store is empty. No legacy record is exposed by public routes.

## Shared Beta password
Configure `TAAMEN_PRIVATE_CIRCLE_PASSWORD` only in backend environment/secret storage. Authorized names are configured by `TAAMEN_PRIVATE_CIRCLE_MEMBERS`, for example `Omar|OWNER,كريم,مؤمن`. The password is hashed in backend memory and is never returned to the browser. Login has rate limiting and cooldown behavior.

This is a Beta convenience model. The authentication boundary is intentionally shaped so individual credentials can replace the Circle Password later.

## Profile sharing
Public Profile Share produces an explicit preview and a safe payload containing display name, optional avatar, bio and optional public role. Email, phone, private settings and internal IDs are excluded.

## Match sharing
Private matches are rejected by the public share encoder. Public/local matches can be shared through a lightweight `/share/match/:token` route. The recipient must explicitly add an imported match to local IndexedDB.

## EmailJS
Service: `service_13mkb9h`
Contact: `template_jsugxta`
Auto-reply: `template_4pj4xlm`
Verification: configurable only; no template ID is invented.

## Limitation
The browser cannot reliably detect OS-level screenshots. TAAMEN only promises in-app capture/import/share/download mechanisms.
