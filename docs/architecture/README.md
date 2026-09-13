# TAAMEN 2.0 Beta Architecture

TAAMEN is one football product with two primary user experiences and one administrative layer:

- PUBLIC / LOCAL — for everyone. No password and no mandatory email. Profiles, matches, archives and tactical plans can live entirely on the device.
- PRIVATE CIRCLE — for authorized former players. Private history, real player identities, rankings, statistics, readiness and private tactical plans are server-authoritative after authentication.
- OWNER — management capabilities behind the same private authentication boundary.

## Match domain

Match Center and Archive use the same `Match` model and repository. The normal lifecycle is:

`Create → Upcoming → Live/Finished → Archive`

Public users create local/public records themselves. Archive is a historical view of finished/archived match records rather than an unrelated database.

## Storage strategy

Public storage is IndexedDB first. Keep the repository interface independent from the persistence mechanism so a cloud adapter can later be introduced without rewriting the UI.

Conceptually:

`UI → domain/service → repository → local adapter | cloud adapter`

Private storage is backend-authoritative in Beta. The Beta backend currently uses a JSON data file and in-memory sessions; this is an explicit boundary, not the target long-term database design.

## Data isolation

Public pages must never fetch legacy private history, private player identities, private rankings, private statistics or owner controls. Private routes only request those resources after the server has authenticated the member.

The same rule applies to share payloads, generated images, screenshots and metadata: private information must never be included in a public share artifact.

## Navigation

`src/config/routes.ts` is the source of truth for route metadata. Desktop and mobile navigation derive from the registry so a page does not become inaccessible just because it was not chosen for the primary mobile bar.

## Images

The supplied TAAMEN brand mark is stored in `public/assets/taamen-brand-mark.png` and referenced through `src/config/branding.ts`. Profile images are resized/compressed before local storage.

## Future cloud sync

When cloud storage is introduced, keep local writes immediate and treat remote synchronization as a separate state machine (`local-only`, `pending`, `synced`, `conflict`, `deleted`). Do not make cloud availability a prerequisite for using the public workspace.
