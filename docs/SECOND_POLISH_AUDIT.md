# TAAMEN 2.0 — Second Polish Pass

Implemented from the supplied specification:
- Optional local profile fields; only first name is required.
- Local avatar preview/remove and IndexedDB persistence.
- Optional email ownership confirmation with local OTP, expiry and configurable EmailJS verification template.
- Central EmailJS configuration; no private secrets in source.
- Contact Us + auto-reply adapter with explicit success/failure states.
- Profile editing, privacy/analytics preferences and TAAMEN-only local data deletion.
- Notification center with unread count, filters, mark-all-read and clear.
- Experimental AI conversation UX with local/remote source distinction.
- Tactical player inspector, manual coordinates, roles/instructions, captain validation and local persistence.
- AR/EN labels and RTL/LTR shell.
- Reduced-motion support and mobile navigation.

Email verification is intentionally not account authentication. It confirms control of an email for optional local-profile features.

## Final polish additions
- Settings/profile surfaces now use TAAMEN dark-glass controls with explicit empty/current states.
- Tactical Board now uses pointer hold/drag positioning and hides numeric X/Y controls from the user; manual movement is persisted as `positionMode: manual`.
- Tactical has a local portrait/landscape mode with Screen Orientation API best-effort lock and an in-app fallback.
- Screenshot Wallet supports local capture best-effort, screenshot import, local IndexedDB storage, download and Web Share fallback.
- Screenshot capture never claims to detect OS-level screenshots; Import Screenshot is the guaranteed cross-browser path.
- Arabic/English copy is included for the new controls and states.
- The official supplied TAAMEN logo image was not available in this pass, so the existing textual brand mark remains instead of inventing or redrawing an official logo.
