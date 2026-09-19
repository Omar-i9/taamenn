# Sharing

Public match sharing and public profile sharing use safe client-side payloads for small records.

Routes:
- `/share/match/:token`
- `/share/profile/:token`

Tokens are client-readable JSON in base64url. That is encoding, not encryption.
`allowSave` is an application-level import gate.

Recipients see a preview before local import. Private match records are rejected by the public match encoder. Profile shares include only display name, optional avatar/banner and optional public role; email, phone, member codes and private settings are excluded. Oversized profile images are omitted so the URL stays within common URI limits.

GitHub Pages/static hosting: `public/404.html` stores the original path and bounces to `/`; the app restores it before boot. Cloudflare SPA fallback serves `index.html` for the same paths.
