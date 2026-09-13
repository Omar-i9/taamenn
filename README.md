# TAAMEN 2.0

TAAMEN 2.0 is one local-first football workspace with two experiences that share the same shell and design system:

- **Normal / General User** — no username or password. The active local TAAMEN experience includes Home, Archive, Match Center, Tactical Playground, Profile, Settings and Support.
- **Featured / Special Member** — lightweight member recognition from Settings using a Member ID only. It is intentionally read-only and exposes the historical archive and historical Match Center records only.

The Featured Member ID is an identifier, **not a password and not strong authentication**.

## Feature boundaries

| Feature | Normal | Featured |
|---|---:|---:|
| Home | YES | YES |
| Profile | YES | YES |
| Settings | YES | YES |
| Support | YES | YES |
| Current Archive | YES | NO |
| Historical Archive | NO | YES |
| Create / archive local matches | YES | NO |
| Match Center | YES | HISTORY ONLY |
| Tactical Playground | YES | NO |
| Tactical Radar | NO | NO |
| AI Assistant | NO | NO |
| Historical Match Records | NO | YES |
| Edit/Delete historical records | NO | NO |

## EmailJS

Supplied contact configuration remains available. Email verification is deliberately **frozen / Coming Soon** until a real verification flow and template are configured. No verification template ID is invented.

```env
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
VITE_EMAILJS_VERIFICATION_TEMPLATE_ID=
VITE_API_BASE_URL=http://localhost:8787/api
```

## Local development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
npm run backend
```

The normal user experience is local-first and uses IndexedDB. Backend member recognition is retained as a lightweight compatibility endpoint; the UI does not treat Member IDs as passwords.

## Historical archive

The historical source is the established TAAMEN legacy repository/data snapshot. The migration currently contains **24 historical Match Center records**. Historical records carry `source: legacy`; locally created records use `source: local`. Historical data is lazy-loaded behind the Featured route boundary and is not imported by the normal archive repository.

## PWA

The existing PWA manifest and service worker are preserved.

## AI

AI Assistant, AI navigation, AI page, AI entry points and AI API routes are removed from the active product.
