# TAAMEN 2.0 — Final Product Pass Report

> **HISTORICAL / ARCHIVE DOCUMENT.** Notes from an earlier product pass. Not the current architecture. See `docs/architecture/README.md`.

## A. What changed

- Separated the product into two route-aware application contexts: `normal` and `featured`.
- General users keep current football management: Match Center, current/local archive, and Tactical Playground.
- Featured members are limited to historical archive browsing and historical match records.
- Removed historical-data leakage from the normal Home/Archive data path.
- Historical data is now behind a dedicated `historicalArchiveRepository` feature boundary and is dynamically loaded only for Featured views.
- Featured Member access remains Settings-only.
- Featured login now uses the generic `user#****` format placeholder and never pre-fills a real member identifier.
- Removed defensive/permission-warning copy from the Featured entry surface.
- Featured Home/Profile surfaces now acknowledge the resolved member without replacing the general local profile data.
- Removed obsolete private tactical mode from Tactical Playground; the active playground is local-first for General Users.
- Added a proper tactical focus mode state, desktop expansion, mobile landscape optimization, player state feedback, touch-friendly targets, tactical helper chips, and persisted undo/redo changes.
- Date/time now forces Latin numeric digits with `numberingSystem: 'latn'` and uses logical inline positioning.
- Notification lifecycle now includes approaching, starting soon, started, completed, and archived events with stable IDs and Arabic/English labels.
- Service worker version bumped to `v4` so updated shells do not remain trapped behind the previous cache version.
- Added a deterministic structural QA suite and wired it to both `npm test` and `npm run qa:final`.

## B. General User Experience

General Users have:

- Home
- Profile
- Settings
- Support
- Current/local Archive
- Match Center
- Create Match
- Manage Current Match
- Tactical Playground
- Current/local archive creation
- Notifications
- Backup/import and existing local-first utilities

General Users do **not** receive the historical TAAMEN archive, Tactical Radar, or AI Assistant.

## C. Featured Member Experience

Featured access is available only from Settings.

After a valid member identifier is resolved, the application switches to Featured context and exposes:

- Home
- Profile
- Settings
- Support
- Historical Archive (`السجل التاريخي`)
- Historical Match Center
- Read-only historical match records

Featured context does not expose current Match Center operations, Tactical Playground, historical editing/deletion, Tactical Radar, or AI.

Leaving Featured mode returns the user to the General context without clearing the general profile, matches, archive, notifications, tactical drafts, or local settings.

## D. Permission Matrix

| Feature | General | Featured |
|---|---:|---:|
| Home | YES | YES |
| Profile | YES | YES |
| Settings | YES | YES |
| Support | YES | YES |
| Current Archive | YES | NO |
| Historical Archive | NO | YES |
| Create Archive | YES | NO |
| Match Center | YES | HISTORY ONLY |
| Create Match | YES | NO |
| Manage Current Match | YES | NO |
| Historical Match Records | NO | YES |
| Edit Historical Records | NO | NO |
| Delete Historical Records | NO | NO |
| Tactical Playground | YES | NO |
| Tactical Radar | NO | NO |
| AI Assistant | NO | NO |
| Featured Member Login | Settings only | N/A |

## E. Featured Member Directory

Configured from the established TAAMEN backend member seed. IDs are local member identifiers, not passwords.

- Omar → `user#E9772`
- Hani → `user#223G5`
- Kareem → `user#13F4`
- Muhammad Ali → `user#93D07`
- Mo'men → `user#03651`
- Ibrahim → `user#C7E7E`
- Arqam → `user#B67E6`
- Moayad → `user#3C885`
- Khodr → `user#7A2D1`
- Yusuf → `user#4B91C`
- Abu Turki → `user#8F26A`
- Kareem Al-Tamimi → `user#5D3E8`
- Suwairki → `user#6C2B4`
- Zaid → `user#A4E71`
- Abu Zughair → `user#D83F2`
- Muhammad → `user#91B6D`
- Sanqurt → `user#E52A9`
- Ahmad → `user#F74C1`
- Amr → `user#2C8E5`
- Al-Skafi → `user#6B1F3`
- Ghatasha → `user#B4D27`
- Allama → `user#C9A41`

The Featured entry UI does not reveal these identifiers and uses only `user#****` as its placeholder.

## F. Historical Data

- Migrated records: **24**.
- Source: controlled TAAMEN legacy snapshot (`backend/legacy-private-matches.json`).
- Migration is deterministic through `scripts/migrate-legacy-archive.mjs`.
- Stable IDs are preserved.
- Teams, scores, dates, and match types were checked against the legacy source with **0 field mismatches**.
- Duplicate IDs: **0**.
- All migrated records carry historical source metadata (`legacy-taamenn` in the source snapshot; normalized to `legacy` at repository boundary).
- Stadium/city were absent from the legacy records used for migration; **no stadium/city values were invented**.
- Historical data is not imported by the normal archive repository and is lazy-loaded only when a Featured view explicitly requests it.

## G. Tactical Playground

- General-user-only tactical workspace.
- Wide desktop pitch with fluid sizing.
- Mobile portrait remains usable.
- Mobile landscape has a pitch-dominant Focus mode and orientation lock where the device supports it.
- Desktop Focus mode expands the board without pretending the desktop is a phone.
- Direct pointer/touch dragging is preserved with field boundaries.
- Clear default, hover, focus, selected, dragging, and captain states.
- Player labels and role/position indicators remain readable.
- Existing formations remain available.
- Tactical lines remain below player markers in visual hierarchy.
- Undo/redo, reset, screenshot capture, persistence, and share behavior are preserved.
- Focus state is reversible and keyboard/touch accessible.
- Reduced-motion rules disable decorative motion.
- Obsolete private tactical mode and private-circle UI were removed from the active playground.

## H. Notifications

- Stable notification IDs prevent duplicate lifecycle events.
- Mark-all-read writes `read: true` to IndexedDB.
- Individual delete removes the actual IndexedDB record.
- Delete-all removes records rather than only hiding them.
- Existing deleted records are not recreated by hydration.
- Added localized lifecycle labels for Arabic and English.
- Lifecycle coverage includes approaching, starting soon, started, completed, and archive-created events.

## I. EmailJS

Existing EmailJS integration was preserved:

- Service: `service_13mkb9h`
- Contact template: `template_jsugxta`
- Auto-reply template: `template_4pj4xlm`

Email verification remains intentionally frozen as Coming Soon because no real verification template ID is configured. No template ID was invented and no fake verification email is simulated.

## J. Testing

| Check | Result |
|---|---|
| `npm install` | BLOCKED in this environment — package install/network did not complete |
| `npm run typecheck` | PASS |
| `npm run test` | PASS — deterministic final structural QA |
| `npm run qa:final` | PASS |
| `npm run lint` | NOT CONFIGURED — no lint script/tool exists in the project |
| `npm run build` | BLOCKED — supplied `node_modules` lacks Linux Rolldown native binding |
| `node --check backend/src/server.mjs` | PASS |
| Backend `/api/health` | PASS |
| Backend Featured Member `user#223G5` | PASS → Hani |
| Backend invalid Featured ID | PASS → 404 |
| Legacy migration command | PASS — 24 records |
| Browser frontend smoke test | BLOCKED by the same missing Linux native build/runtime dependency |

The build failure is environmental, not a TypeScript source failure: the included dependency tree contains Windows-native Rolldown binaries, while this validation environment is Linux and has no installed `@rolldown/binding-linux-x64-gnu` binary. A clean `npm install` on the target development OS is required before `npm run build`/`npm run dev` can be treated as a final frontend runtime validation.

## K. Known Limitations

1. Full browser visual QA could not be completed in this Linux execution environment because Vite/Rolldown cannot start without its platform-native optional binary.
2. The Featured identifier remains a local/member-mode recognition mechanism, not real authentication.
3. Historical records contain no stadium/city in the controlled legacy source, so those fields remain omitted rather than fabricated.
4. The project intentionally has no ESLint configuration/script yet; TypeScript typechecking plus the deterministic structural QA suite are currently the automated source-level checks.
