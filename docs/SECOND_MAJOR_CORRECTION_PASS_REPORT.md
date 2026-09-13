# TAAMEN 2.0 — Second Major Correction Pass Report

Date: 2026-09-11

## A. What was changed

[IMPLEMENTED]
- Re-established two experiences inside one TAAMEN shell: Normal/General and Featured/Special Member.
- Restored Normal-user Match Center and Tactical Playground.
- Added a read-only Historical Match Center route for Featured Members.
- Removed AI from active frontend navigation/API client and removed the backend AI endpoints.
- Replaced the main palette with `#BAC8D9`, `#193940`, `#9BF272`, `#7ABF5A`.
- Reworked onboarding into direct profile creation with no Public/Private or Normal/Featured choice.
- Made first name and family name required; email/phone optional.
- Added realistic email/phone placeholders without storing placeholder data.
- Rebuilt the onboarding media composition so the banner sits behind a centered circular avatar.
- Made avatar rendering consistently circular with `object-fit: cover`.
- Replaced the Home date/time card with a compact floating local utility.
- Kept only the clock component on a one-second timer; the whole Home page is not re-rendered every second.
- Forced Latin digits for the date/time numeric display.
- Removed the Home “TAAMEN Identity / History without noise” explanatory card.
- Preserved navigation geometry while changing collapsed desktop behavior to hamburger-only.
- Removed the redundant current-route chip from the top bar.
- Improved Support button hierarchy/states with the new palette.
- Froze email verification as “Coming Soon” instead of running an unconfigured verification flow.
- Added centralized `featuredMembers.ts`.
- Added persistent notification read/delete operations and lifecycle reconciliation.
- Added local Match Center archive operation and explicit `source: local` metadata.

## B. What was preserved

[IMPLEMENTED]
- Existing TAAMEN visual shell and navigation structure were preserved rather than rebuilt.
- Existing Profile, Support, PWA, sharing, screenshot and IndexedDB infrastructure was retained.
- Existing tactical formation/drag/local persistence implementation was reused for Normal users.
- Existing historical migration/data source was retained and validated.
- Existing backend compatibility/member-recognition endpoint was retained for the lightweight Featured Member flow.

## C. What was restored

[IMPLEMENTED]
- Normal-user Match Center.
- Normal-user Tactical Playground.
- Local match creation/edit/result/archive flow.
- Historical Match Center browsing for Featured Members.

## D. What was removed

[IMPLEMENTED]
- Public/Private onboarding choice.
- Normal/Featured onboarding choice.
- User-facing AI navigation/page/entry points.
- Backend AI endpoints and OpenAI setup artifacts from the active product.
- Home identity/explanation card.
- Redundant top-bar route identity chip.

## E. Normal user feature matrix

| Feature | Normal |
|---|---:|
| Home | YES |
| Profile | YES |
| Settings | YES |
| Support | YES |
| Archive | YES |
| Create Archive / local archive | YES |
| Match Center | YES |
| Create Match | YES |
| Manage Current Match | YES |
| Tactical Playground | YES |
| Tactical Radar | NO |
| AI Assistant | NO |
| Historical Archive | YES |
| Historical Match Records | YES |
| Edit/Delete Historical Records | NO |

## F. Featured Member feature matrix

| Feature | Featured |
|---|---:|
| Home | YES |
| Profile | YES |
| Settings | YES |
| Support | YES |
| Historical Archive | YES |
| Historical Match Center | YES, read-only |
| Create Match | NO |
| Manage Current Match | NO |
| Tactical Playground | NO |
| Tactical Radar | NO |
| AI Assistant | NO |
| Administrative Controls | NO |
| Edit/Delete Historical Records | NO |

## G. Historical archive migration result

[VERIFIED]
- Source: `backend/legacy-private-matches.json`, derived from the established TAAMEN legacy data.
- Normalized output: `src/data/historicalArchive.ts`.
- Historical records are marked with `source: legacy-taamenn` in the generated archive and are treated as read-only in the UI.
- Local records use `source: local`.

## H. Number of historical matches migrated

[VERIFIED]
- 24 legacy matches.
- 24 historical archive records.
- 24 unique IDs.
- Score integrity: verified against the legacy source.
- Team-name integrity: verified against the legacy source.
- Date integrity: verified against the legacy source.

## I. Member directory

[IMPLEMENTED]
- Centralized in `src/config/featuredMembers.ts`.
- Member IDs are lightweight identifiers, not passwords or secrets.

## J. Configured Member IDs

[VERIFIED]
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

Known IDs `user#13F4` (Kareem) and `user#223G5` (Hani) were preserved exactly.

## K. Notification fixes

[IMPLEMENTED]
- Persistent `read` updates in IndexedDB.
- “Mark all as read” updates every unread record.
- Individual deletion physically removes the record from IndexedDB.
- Clear/delete does not merely hide notifications.
- Stable event IDs prevent duplicate lifecycle notifications.
- Match approaching, starting-soon, completed, and archive-created events are supported.
- Reduced-motion behavior is respected.

## L. Color system

[IMPLEMENTED]
- Deep environment: `#193940`
- Light neutral surface: `#BAC8D9`
- Primary active/action: `#9BF272`
- Secondary green: `#7ABF5A`
- White text is used where contrast requires it.
- Previous four primary palette values are no longer used as the main CSS palette.

## M. Navigation behavior

[IMPLEMENTED]
- Expanded desktop navigation keeps the existing layout.
- Collapsed desktop navigation shows a hamburger control instead of the TAAMEN logo.
- Clicking the hamburger expands the sidebar and restores the logo/labels.
- RTL/LTR positioning uses logical layout properties.
- Featured navigation hides Normal-only Match Center and Tactical Playground routes.

## N. Profile/onboarding behavior

[IMPLEMENTED]
- Direct onboarding into profile creation.
- No Public/Private selection.
- No Normal/Featured selection.
- No username/password fields.
- First name and family name required.
- Email/phone optional.
- Banner and avatar optional.
- Avatar centered over banner.
- Avatar uses circular cover crop throughout the shell.
- Old onboarding 01/02/03 footer removed.

## O. EmailJS status

[IMPLEMENTED]
- Contact email flow remains available.
- Verification is frozen as **Coming Soon** because no real verification template/backend flow is configured.
- No fake verification template ID was introduced.

## P. PWA status

[IMPLEMENTED]
- Existing manifest and service-worker infrastructure preserved.

## Q. TypeScript result

[VERIFIED]
- `tsc -b` completed successfully in the available Linux toolchain.

## R. Build result

[BLOCKED]
- `npm run build` could not complete in this execution environment because the copied dependency tree does not contain the Linux-native optional TypeScript/Rolldown binaries.
- The failure was confirmed by the actual runtime error for the missing Linux native executable/binding.
- The final ZIP intentionally excludes `node_modules` so the project can perform a clean `npm install` on the user's OS rather than shipping incompatible Windows/Linux native dependencies.

Recommended local verification:

```bash
npm install
npm run typecheck
npm run build
```

## S. Test result

[PARTIAL]
- No `lint` script exists in `package.json`.
- No `test` script exists in `package.json`.
- Backend JavaScript syntax check passed.
- Backend health endpoint was verified.
- Featured member recognition was verified for `user#13F4` and `user#223G5`.
- Invalid Featured Member ID returned 404.
- Historical migration integrity checks passed for count, IDs, scores, teams and dates.

## T. Known limitations

[PARTIAL]
- A production browser build was not executable in this container because the project dependency tree intentionally excludes platform-native modules and outbound npm access is unavailable here.
- Email verification remains intentionally frozen until a real provider template/flow is configured.
- Featured Member IDs are lightweight recognition identifiers, not strong authentication.
- Historical fields not present in the source remain unavailable rather than being guessed.
