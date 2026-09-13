# Sharing

Public match sharing and public profile sharing use safe client-side payloads for small records.

Routes:
- `/share/match/:token`
- `/share/profile/:token`

Recipients see a preview before local import. Private match records are rejected by the public match encoder. Profile shares include only display name, optional avatar, bio and optional public role; email, phone and private data are excluded.

GitHub Pages/static hosting is supported with `public/404.html` as the SPA fallback.
