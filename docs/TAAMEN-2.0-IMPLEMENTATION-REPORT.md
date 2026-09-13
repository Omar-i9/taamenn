# TAAMEN 2.0 — Implementation Pass

## Verified
- Existing React/Vite/TypeScript architecture audited and modified in place.
- Official TAAMEN logo asset retained; supplied brand-mark file matches `public/assets/taamen-brand-mark.png`.
- TypeScript project check passes with `npm run typecheck`.
- Backend starts and responds on port 8787.
- Featured Member recognition tested with `user#13F4` → Kareem.
- Invalid Featured Member identifier tested → HTTP 404.
- Legacy archive migration script processed 24 historical matches.

## Implemented
- Removed Public/Private onboarding choice.
- Normal users now create a local profile directly and bypass registration/authentication.
- Added first name, family name, email, phone, profile photo and cover image to onboarding.
- Removed user-facing AI Assistant, Tactical Radar, Match Center, private dashboard routes and obsolete navigation.
- Added Settings-based Featured Member entry and historical-only Featured Member view.
- Added stable member identifiers; Kareem uses `user#13F4`, Hani uses `user#223G5`.
- Added controlled legacy archive migration script at `scripts/migrate-legacy-archive.mjs`.
- Normalized 24 historical matches into `src/data/historicalArchive.ts` without inventing missing stadium/city/time data.
- Reworked Archive as a primary product surface.
- Added reusable MatchCard with derived winner/draw logic, match-type semantics and reduced-motion-aware confetti.
- Added local-device DateTime component that updates only its own clock state.
- Reworked profile/onboarding image handling while keeping local persistence.
- Replaced the main visual system with the specified deep green/lime/light palette.
- Redesigned navigation, mobile bottom navigation, forms, cards and archive filters.
- Preserved EmailJS configuration and PWA infrastructure.
- Preserved backend AI/auth infrastructure as non-user-facing infrastructure rather than exposing it.
- Updated Support defaults to the specified official WhatsApp channel and support number.

## Removed user-facing files/routes
- AccessGate
- PrivateShell
- PrivateMemberProfile
- AI page
- Match Center page
- Tactical page
- Statistics page
- Readiness page
- Control Center page
- Public Players page

Reusable backend/domain infrastructure was not blindly deleted.

## Build status
- `[VERIFIED]` `npm run typecheck`
- `[VERIFIED]` backend startup and Featured Member endpoint
- `[VERIFIED]` archive migration script
- `[BLOCKED]` `npm run build` in the provided Linux execution environment because the uploaded `node_modules` contains a Windows Rolldown native dependency and the environment has no package-registry network access to install the Linux binding. This is an environment/dependency-tree limitation, not a TypeScript error.

## Known limitation
A browser-level visual QA pass could not be completed inside this execution environment. The source-level responsive, RTL/LTR, reduced-motion and accessibility rules were implemented, but visual verification should be performed by running the project locally in a browser.
