# TAAMEN 2.0 — Rebuild & Audit

## Baseline audit of the uploaded ZIP
The uploaded archive contained a React/Vite MVP with:
- `localStorage` for profile/language.
- `src/services/archiveStorage.ts` described as a future IndexedDB seam, but no IndexedDB implementation.
- Match Center and Archive rendered from imported static arrays rather than a shared repository.
- A notification bell that did not open a notification center.
- No actual email adapter/endpoint integration.
- No dynamic imports/lazy page chunks.
- A compile-breaking `+` patch artifact in `src/App.tsx`.
- `dist/` and `node_modules/` were generated artifacts in the uploaded archive.

## Rebuild changes
- Local Profile moved to IndexedDB (`profile` store).
- Settings/tactical state and notifications use IndexedDB.
- Match Center + Archive use the same `Match` type and `matchRepository`.
- Notification Center supports unread state and mark-as-read.
- Pages use React `lazy()` dynamic imports.
- Local AI is isolated in its own lazy page and never embeds an API key.
- Tactical formation persistence is local.
- Email adapter supports a secure `VITE_EMAIL_ENDPOINT`; without it, it creates a browser `mailto:` draft. This intentionally does not pretend that a frontend-only app can send SMTP mail securely.
- PWA manifest and service worker retained/rebuilt.
- UI moved to a restrained dark-blue glass system; no neon-heavy treatment.
- Arabic/English direction switching remains.
- Existing match/tactical/readiness data from the uploaded rebuild is preserved.

## Verification
- TypeScript project check passes with TypeScript 5.8.3 in this environment.
- The uploaded `node_modules` was Windows/native-platform-specific and could not run Vite on this Linux environment. The final source archive therefore excludes `node_modules` and generated `dist`; run `npm install` then `npm run build` on the target machine.

## Important boundary
A real automated email sender still requires a server-side endpoint or provider. Browser code must not contain SMTP credentials/API secrets.
