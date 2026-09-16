# TAAMEN 2.0 BETA — MASTER DEVELOPMENT / REBUILD / POLISH SPECIFICATION

> **HISTORICAL / ARCHIVE DOCUMENT.** This specification describes an earlier Beta that included Private Circle. It is **not** the current product architecture. See `docs/architecture/README.md` for the current local-first model.
>
> This document must not be treated as authorization to reintroduce Private Circle.


---

## 00 — PRODUCT DEFINITION: WHAT TAAMEN 2.0 ACTUALLY IS

TAAMEN 2.0 is **one football product for everyone**, with a private historical environment embedded inside it.

It is **NOT** a private-club application with a public landing page.
It is **NOT** an admin dashboard.
It is **NOT** a static archive viewer.
It is **NOT** a rewrite whose purpose is only to make the old site prettier.

The product model is:

```text
                          TAAMEN
                            │
            ┌───────────────┴────────────────┐
            │                                │
      PUBLIC / LOCAL                   PRIVATE CIRCLE
            │                                │
      New / general users               Former players
      local profile                     historical data
      create matches                    private archive
      create archive                    private stats
      tactical board                    private tactics
      public sharing                    private analysis
      public statistics                 private rankings
      experimental AI                   real player identities
            │                                │
            └────────────────┬───────────────┘
                             │
                     OWNER / ADMIN
```

All three scopes are still **the same TAAMEN**. They share the same visual identity, navigation philosophy, component system, interaction language, and product quality bar. Scope changes **data visibility, permissions, and capabilities**, not the identity of the application.

### Core product principles

1. **Public first.** Anyone can use the main TAAMEN experience.
2. **Private by authorization, not by hiding.** Private data must never be fetched merely to hide it in the UI.
3. **Local first today.** Public profile/match/archive data is primarily local in the current Beta.
4. **Cloud ready tomorrow.** The storage layer must be replaceable/syncable without rewriting the UI/domain model.
5. **Private Circle is historical continuity.** It exists primarily to preserve the former players' actual identity, match history, archive, statistics, tactical information, and related private material.
6. **The user creates the public football record.** Public matches and archive entries must be first-class user-created records, not hardcoded demo content.
7. **No fake functionality.** A button must either work, explain why it is unavailable, or be omitted. Never simulate successful verification, email delivery, cloud sync, or AI capability.
8. **No legacy patch accumulation.** Reuse proven behavior/data where useful, but do not copy old architecture into 2.0 merely because it already exists.

---

## 00.1 — LEGACY REPOSITORY IS REFERENCE DATA, NOT THE 2.0 ARCHITECTURE

The historical TAAMEN repository contains useful features, behavior, visual ideas, accumulated fixes, legacy data, and lessons from previous rebuilds. Treat it as a **legacy knowledge base**.

Use it to answer:

- What did the old product do?
- Which features are valuable?
- Which edge cases have already been discovered?
- Which legacy match/player/archive data is authoritative?
- Which behaviors should be preserved?

Do **not** answer those questions by copying the old folder structure into 2.0.

The current 2.0 architecture remains the source of implementation direction:

```text
React / TypeScript
        ↓
Pages + shared components
        ↓
Domain models / services
        ↓
Repositories
        ↓
Local IndexedDB OR backend/cloud adapter
```

---

## 00.2 — CURRENT BETA ARCHITECTURAL BASELINE

The supplied Beta already contains the beginnings of the correct architecture. Preserve and strengthen it:

```text
src/
  components/
  config/
  data/
  i18n/
  pages/
  services/
  styles/
  utils/

backend/
  src/
  data.json
  legacy-private-matches.json

public/
  manifest.webmanifest
  sw.js
```

Important existing seams to preserve or improve:

- `matchRepository`
- `profileRepository`
- `localDb`
- `apiClient`
- `shareService`
- `profileShareService`
- `emailAdapter`
- `notificationService`
- `screenshotService`
- `tacticalOrientation`
- route metadata / lazy pages
- scoped backend endpoints

Do not bypass these seams by putting new database logic directly in React pages.

---

# 00.3 — THE THREE DATA WORLDS

TAAMEN 2.0 has three distinct data/security worlds.

### WORLD A — PUBLIC / LOCAL

Designed for general users.

Primary characteristics:

- no private-member authorization required
- local profile
- local matches
- local archive
- local tactical state
- public-safe sharing
- public-safe statistics
- optional future cloud backup/sync

The browser should be able to operate meaningfully without a cloud account in the current Beta.

### WORLD B — PRIVATE CIRCLE

Designed for authorized former players.

Primary characteristics:

- authenticated access
- actual member identity
- legacy historical archive
- private player identities
- private statistics/rankings
- private tactical context
- private notifications where applicable
- server-authoritative private records

### WORLD C — OWNER / ADMIN

Designed for operational management.

Primary characteristics:

- server-side authorization
- member management
- password reset/rotation
- activation/deactivation
- private content management
- audit/health information
- operational controls

---

# 00.4 — DATA OWNERSHIP MUST BE EXPLICIT

Every persistent domain object should have a clear ownership model.

At minimum, public `Match` records should support a conceptual model such as:

```text
id
createdBy
createdAt
updatedAt
visibility
status
teams
participants
schedule
result
statistics
metadata
```

Where possible, use a stable identifier rather than display names as relationships.

Do not build long-term relationships around array indexes such as `Player 1`, `Player 2`, etc. Generic player labels are a presentation fallback for public tactical mode, not a permanent identity model.

---

# 00.5 — VISIBILITY IS A DOMAIN RULE, NOT A UI STYLE

Supported visibility states:

```text
LOCAL
PUBLIC
PRIVATE
```

Interpret them consistently:

- `LOCAL`: visible only within the user's local workspace unless explicitly exported/shared.
- `PUBLIC`: safe for public rendering/sharing according to the product's public-safe schema.
- `PRIVATE`: accessible only to authorized Private Circle users and owner/admin paths.

A record's visibility must be enforced in:

- repositories
- API authorization
- data selection
- serialization
- share payload generation
- image generation
- metadata
- cache policy
- AI context retrieval

Never rely on CSS, route hiding, or conditional rendering as the security boundary.

---

# 00.6 — PUBLIC MATCH / ARCHIVE LIFECYCLE

This is a core product flow and must be treated as first-class logic.

```text
CREATE
  ↓
DRAFT (optional where useful)
  ↓
UPCOMING
  ↓
LIVE (optional)
  ↓
FINISHED
  ↓
ARCHIVE VIEW
```

The Archive is not a second unrelated database. Match Center and Archive consume the same authoritative `Match` domain model/repository.

A user must be able to:

```text
Create Match
→ Save
→ View in Match Center
→ Edit while permitted
→ Start/mark live where supported
→ Enter result
→ Finish
→ View in Archive
→ Share if public-safe
```

The exact UI can differ, but the data model and repository must remain coherent.

### Archive creation

The public experience must not require the developer to hardcode archive entries.

Users should be able to create an archive record naturally by completing a match or explicitly adding an archived match according to the supported flow.

Do not duplicate the same match as a separate disconnected Archive object unless a future migration explicitly requires a normalized projection.

---

# 00.7 — PUBLIC PROFILE + EMAIL VERIFICATION MODEL

The new/public user experience must remain low-friction, but it must support real email verification when an email address is supplied.

Recommended model:

```text
Enter TAAMEN
   ↓
Create local profile
   ↓
Optional / contextual email prompt
   ↓
Enter email
   ↓
Request verification code
   ↓
Send actual OTP through configured provider
   ↓
User enters code
   ↓
Verify
   ↓
Store verification state locally
```

Important:

- Do not claim an email is verified because the provider accepted an email request.
- Do not mark `emailVerified=true` until the code itself has been validated.
- Do not fabricate a verification template ID.
- Do not put SMTP/API secrets in frontend code.
- Verification state should include enough metadata for future maintenance, e.g. `verifiedAt`, and preferably a version/attempt model rather than one boolean alone.
- Verification codes should be short-lived, one-time, rate-limited, and never stored in plaintext in persistent client storage.
- Never log raw verification codes.

For the current Beta, if the real verification provider/template is not configured, the UI must clearly say verification is unavailable/not configured rather than pretending it happened.

---

# 00.8 — EMAILJS IS AN EMAIL PROVIDER, NOT AUTHENTICATION

Keep the existing configuration identifiers exactly where already defined:

```text
service_13mkb9h

Contact:
template_jsugxta

Auto-reply:
template_4pj4xlm
```

A real verification template must only be used after a real provider template ID has been supplied.

Do not confuse:

```text
Email sent successfully
```

with:

```text
Email ownership verified
```

The second requires proof through the verification code flow.

---

# 00.9 — PRIVATE CIRCLE AUTHENTICATION: BETA VS FUTURE

The existing Beta may use a temporary provisioning flow, but the product specification must treat **individual member credentials** as the target behavior.

Required member identity model:

```text
memberId
loginIdentifier
displayName
nameAr
nameEn
role
status
passwordHash
createdAt
updatedAt
```

The current approved private member names are:

1. Omar / عمر
2. Hani / هاني
3. Kareem / كريم
4. Mohammad Ali / محمد علي
5. Moamen / مؤمن
6. Ibrahim / ابراهيم
7. Arqam / ارقم
8. Moayad / مؤيد

Each member must have a different credential set.

**Do not create a shared password as the final product design.**

For transitional Beta provisioning, temporary environment-based setup is acceptable only when:

- passwords are generated securely,
- plaintext credentials are not committed to source control,
- only password hashes remain in persistent storage,
- credentials are shown once to the administrator when appropriate,
- normal server startup does not print them.

Use a memory-hard password hashing method such as `scrypt` or `Argon2id`.

Use secure server-side sessions. Do not store authentication tokens in `localStorage` or IndexedDB.

---

# 00.10 — PRIVATE ACCESS MUST BE INDIVIDUAL, NOT ROLE-ONLY

The application must know **which authorized member** is logged in, not merely that “someone from the circle” is authenticated.

Why:

- personal dashboard
- real player identity
- personal ranking/form where available
- auditability
- future individual preferences
- account/session invalidation
- member-level permissions later

Owner remains a role. Member identity remains a person.

---

# 00.11 — LOCAL-FIRST, CLOUD-READY STORAGE CONTRACT

Do not postpone this architectural abstraction until cloud storage is introduced.

Use a repository/storage contract that allows:

```text
UI
 ↓
Domain service
 ↓
Repository interface
 ↓
Local IndexedDB adapter

and later:

Repository interface
 ↓
Cloud API adapter
```

Future synchronization must be additive, not a rewrite.

Introduce conceptual synchronization states where useful:

```text
LOCAL_ONLY
PENDING_SYNC
SYNCED
CONFLICT
DELETED_REMOTE / TOMBSTONE
```

Do not silently overwrite local changes with remote changes.

A future cloud design should support:

- stable record IDs
- timestamps
- updatedAt
- version/revision where needed
- conflict handling
- deletion markers
- retry
- offline edits
- background synchronization

---

# 00.12 — PUBLIC DATA SHOULD NOT BE UPLOADED SILENTLY

The current public/local product must never silently upload the user's local profile, matches, archive, images, screenshots, or tactical state simply because a network is available.

A future cloud feature must be explicit and understandable:

```text
Local only

or

Backed up / Synced
```

The user should be able to understand where their data lives.

---

# 00.13 — PRIVATE DATA SHOULD BE SERVER-AUTHORITATIVE

For the Private Circle:

```text
Server
  ↓
authorized private data
  ↓
client cache / UI
```

The browser may cache private data for UX, but the browser must not become the authority for membership, permissions, or protected history.

---

# 00.14 — PUBLIC/PRIVATE AI BOUNDARY

AI must receive context according to the current scope.

Public AI:

```text
public/local context only
```

Private AI:

```text
authorized private context only
```

Owner tooling may access additional operational context according to explicit permissions.

Never pass private player names, private statistics, legacy archive entries, or private tactical history into public AI retrieval merely because they exist in another local file.

The AI remains explicitly **experimental / Beta** until a stronger model-backed implementation exists.

---

# 00.15 — BRANDING ASSET: USE THE SUPPLIED IMAGE

The provided brand image is part of this specification:

**`TAAMEN-2.0-brand-mark.png`** (source image supplied by the product owner as `favicon.png`).

Use the supplied image as the exact visual brand asset/reference for:

- favicon where technically appropriate
- opening/splash branding
- compact sidebar mark
- PWA icon/branding where dimensions permit
- loading states
- Private Circle branding
- share-image branding

Do not redraw it.
Do not substitute an invented symbol.
Do not alter its core geometry.
Do not stretch it.

Where a production multi-size icon set is technically required, derive appropriately cropped/resized variants from the supplied source without changing the underlying mark.

If a future official higher-resolution transparent asset is provided, replace the source asset centrally rather than editing every component.

---

# 00.16 — BRANDING VS FAVICON DISTINCTION

Do not assume that a favicon-size image is automatically the best full-size logo lockup.

Use the supplied image as the compact brand mark, while keeping branding centralized so a later official horizontal/full logo can be swapped in without rewriting the UI.

Recommended config model:

```ts
branding = {
  mark,
  logo,
  favicon,
  appName,
}
```

The exact object shape can differ, but the principle must remain.

---

# 00.17 — VISUAL DIRECTION

TAAMEN should feel:

```text
premium
football-first
calm
modern
deep
fast
intentional
```

Avoid:

```text
generic SaaS
banking dashboard
insurance portal
admin template
overly neon gaming UI
random glassmorphism
excessive gradients
```

Use the existing palette from the attached specification, but prioritize **hierarchy and contrast over decoration**.

The user should feel that every component belongs to the same football product.

---

# 00.18 — THE TACTICAL RADAR IS A TOOL, NOT A CARD

The Tactical Radar must be treated as an actual workspace.

Desktop:

```text
large pitch
↓
operations area below
```

Mobile:

```text
enter tactical mode
↓
landscape/full-screen workspace
↓
large pitch
↓
compact controls
```

The pitch is the visual centerpiece. Controls should serve the pitch, not dominate it.

Formation selection must modify real player coordinates/state.

---

# 00.19 — PUBLIC TACTICAL IDENTITY

In public/local mode, use generic player identities by default:

```text
Player 1
Player 2
Player 3
Player 4
Player 5
```

In the Private Circle, authorized real player identities may be shown according to private data.

Do not leak private names into public tactical snapshots, generated images, share payloads, page metadata, or client-side preloaded datasets.

---

# 00.20 — ROUTING / NAVIGATION MUST BE GENERATED FROM ONE REGISTRY

Create one route metadata source containing at minimum:

```text
id
path
label
icon
scope
requiresAuth
mobilePriority
desktopPriority
```

Then derive:

- sidebar navigation
- mobile primary navigation
- More menu
- route guards
- discoverability

from that source.

Do not maintain independent hardcoded route lists that will inevitably drift apart.

---

# 00.21 — PUBLIC MOBILE ACCESSIBILITY IS A PRODUCT REQUIREMENT

A page is not considered implemented if the user cannot discover it on mobile.

Use:

```text
Primary bottom navigation
+
More sheet/drawer
```

The exact primary five destinations may vary, but all available public pages must remain reachable.

Do not hide functionality simply because only five icons fit in the bottom bar.

---

# 00.22 — ERROR ISOLATION

The shell must survive feature failures.

Use feature-level error boundaries around heavy/independent areas such as:

- Tactical
- AI
- Archive
- Weather
- Profile
- Settings
- Private Circle
- Control Center

A failing feature should produce a recoverable state, not a blank application.

---

# 00.23 — PERFORMANCE BUDGET

Public initial entry must remain lightweight.

At first load, do not initialize:

- private datasets
- owner tools
- heavy AI resources
- private statistics
- unnecessary screenshot processing
- heavy tactical analytics

Load feature code on demand.

Do not sacrifice product quality for an arbitrary “tiny bundle” target; optimize for **fast perceived readiness and stable interaction**.

---

# 00.24 — PWA / CACHE PRIVACY

The service worker may cache the public application shell and appropriate static resources.

It must not blindly cache private API responses as public cache entries.

Private data and credentials must not become accessible through a shared service-worker cache path.

---

# 00.25 — IMAGE DATA RULES

For avatars, banners, screenshots and other user-selected images:

- validate MIME/type
- enforce reasonable size limits
- resize where appropriate
- compress
- avoid storing unnecessary giant source files
- use object-fit/object-position correctly
- never stretch
- preserve subject areas where possible

Public local images belong in IndexedDB or an appropriate blob store, not huge `localStorage` strings.

---

# 00.26 — DATE/TIME IS DATA

Match weekday must be derived from the authoritative match date/time and timezone.

Do not maintain a manually editable weekday field when it can drift out of sync.

The presentation should support:

```text
DAY
DATE
TIME
```

Use locale-aware Arabic/English formatting and a consistent product timezone strategy.

---

# 00.27 — DESIGN SYSTEM MUST PREVENT ANOTHER REBUILD CYCLE

Do not fix the same visual defect separately in ten pages.

Centralize:

- Button
- Card
- PageHeader
- Modal
- BottomSheet
- Input
- Select
- Badge
- Toast/Notice
- EmptyState
- LoadingState
- ErrorState
- spacing tokens
- radius tokens
- motion tokens
- typography tokens
- color tokens
- z-index layers
- breakpoints

The purpose is not just cleanliness. The purpose is to prevent TAAMEN 2.0 from becoming another cycle of local patches.

---

# 00.28 — NO FEATURE MAY BE “VISUAL ONLY” WHEN THE SPEC SAYS IT IS FUNCTIONAL

Examples:

- Formation selector → must change coordinates.
- Email verification → must validate OTP.
- Match archive → must come from the match lifecycle/domain.
- Share import → must explicitly create a local copy after confirmation.
- Private access → must be server-authorized.
- Save → must persist actual state.
- Password reset → must affect authentication state and invalidate sessions where required.
- Public/private separation → must be enforced before data is loaded.

---

# 00.29 — MIGRATION RULES FROM THE LEGACY PROJECT

For every legacy feature, classify it as:

```text
KEEP BEHAVIOR
REWRITE ARCHITECTURE
REDESIGN UX
MERGE
DEPRECATE
DROP
```

Do not migrate files mechanically.

For legacy data:

- preserve authoritative existing values
- do not fabricate missing statistics
- mark unavailable data as unavailable
- keep legacy private records private
- normalize only when semantics remain intact
- record migrations deterministically where needed

---

# 00.30 — EXECUTION ORDER FOR THIS BETA PASS

Do not implement randomly. Use this order:

### Phase 1 — Audit

- inspect repository
- inspect routes
- inspect components
- inspect services
- inspect storage
- inspect backend
- inspect email configuration
- inspect legacy data
- inspect branding asset
- identify duplicated UI systems
- identify contradictions in current behavior

### Phase 2 — Foundations

- route registry
- domain types
- repository boundaries
- design tokens
- shared Button/Card/PageHeader/Input/Modal systems
- public/private guards
- storage abstraction
- error boundaries

### Phase 3 — Public user journey

- opening
- public entry
- profile creation
- email flow
- match creation
- match editing
- match completion
- archive
- sharing/import
- profile sharing
- settings

### Phase 4 — Tactical

- pitch correctness
- drag performance
- formation engine
- inspector
- save/reload
- responsive tactical mode
- share snapshot

### Phase 5 — Private Circle

- member identity
- login
- secure session
- rate limiting
- private home
- private archive
- statistics/rankings
- real player mapping
- tactical private context
- owner management

### Phase 6 — Polish / resilience

- loading
- empty
- error states
- RTL/LTR
- accessibility
- reduced motion
- breakpoints
- PWA cache audit
- image optimization
- final visual consistency

### Phase 7 — Validation

Run:

```text
Typecheck
Lint
Build
Tests
Manual mobile QA
Manual desktop QA
Authentication matrix
Privacy/data-leak audit
Share-payload audit
```

---

# 00.31 — NON-NEGOTIABLE “DO NOT” LIST

Do not:

- reintroduce the old architecture into React
- add a second competing routing system
- add a second competing match model
- add a second competing storage path without a clear migration reason
- use CSS to implement security
- prefetch private data on public entry
- store passwords in frontend code
- store passwords in localStorage/IndexedDB
- commit credentials to Git
- invent EmailJS verification configuration
- fake email verification
- fake cloud sync
- fake AI certainty
- expose private data in share links
- expose private data in screenshots/metadata
- make public archive dependent on private data
- make private identity depend only on a display name
- create desktop-only features with no mobile path
- make formation controls cosmetic
- allow one failed feature to blank the whole shell
- duplicate global UI fixes page by page
- use `latest` package versions where reproducible pinned versions are required
- ship development `localhost` API defaults as production behavior

---

# 00.32 — ACCEPTANCE CRITERIA FOR “DONE”

The Beta is not “done” because the code compiles.

It is done when a new public user can:

```text
Open TAAMEN
↓
Enter public experience quickly
↓
Create/edit local profile
↓
Add email
↓
Receive real verification code when configured
↓
Verify email
↓
Create match
↓
Edit match
↓
Complete match
↓
See it in archive
↓
Share it safely
↓
Import a shared match explicitly
↓
Use tactical board
↓
Use settings/profile
↓
Reach every mobile page
```

And when an authorized former player can:

```text
Open Private Circle
↓
Authenticate as an individual member
↓
Receive a server-backed private session
↓
See their authorized private environment
↓
Access legacy history
↓
See actual player identities where permitted
↓
Use private archive/statistics/tactics
↓
Log out
```

And when the owner can:

```text
Manage members
Manage credentials
Manage authorization
Manage private content
Inspect operational state
```

without exposing private secrets to the browser unnecessarily.

---

# 00.33 — FINAL PRODUCT NORTH STAR

The finished TAAMEN 2.0 Beta should feel like:

> **a real football platform that anyone can use, with a protected historical inner circle for the people who were there before.**

The public side should feel welcoming, simple, useful, local-first and shareable.

The private side should feel personal, historical, statistical and protected.

The owner side should feel operational and secure.

Yet all three must still feel like:

```text
ONE TAAMEN
```

---

# 00.34 — IMPORTANT OVERRIDE TO THE LEGACY TEXT BELOW

The detailed 130-section specification originally supplied with this document remains part of this prompt and should be preserved and executed.

However, where older wording conflicts with the stronger product rules above, **this MASTER section wins**.

In particular:

- Public is for everyone and is the primary TAAMEN product.
- Public users may create their own matches and archive history.
- Public/local data remains local-first in the current Beta.
- Future cloud storage must be an adapter/sync evolution, not a UI rewrite.
- Private Circle is an embedded historical/former-player environment.
- Individual member credentials are the target authentication model; a shared password is not the final design.
- Email verification is a real OTP flow when configured, not a fake success state.
- The supplied brand image must be used as the exact current compact brand mark.
- Legacy repository code is reference knowledge, not the architecture to copy.
- Match Center and Archive remain one coherent domain.
- Private data is never public merely because both exist in the same application.

---

## 00.35 — IMPLEMENTATION REPORT REQUIRED AFTER CHANGES

After implementation, the developer/AI must produce a concise implementation report containing:

```text
1. Files changed
2. New files
3. Removed files (if any)
4. Features implemented
5. Features intentionally left unavailable
6. Public/private boundary changes
7. Storage changes
8. Auth/security changes
9. Email/verification status
10. Tactical changes
11. Mobile/responsive changes
12. Build/typecheck/lint/test results
13. Remaining known limitations
```

Do not claim a feature is implemented if it remains a placeholder.

---

# ORIGINAL DETAILED BETA SPECIFICATION

The complete detailed 01–130 specification supplied with the previous project brief follows below. Preserve it because it contains many concrete UI, responsive, tactical, accessibility, sharing, PWA and QA acceptance details. Execute it under the stronger product rules above.

---

نعم. وبالنسبة لآخر تعديل، في نقطة لازم تتصلح عن التصور السابق: **لا تعمل كلمة مرور موحدة**. بما أنك الآن تريد 8 أشخاص، الأفضل أن يكون لكل شخص **اسم دخول + كلمة مرور مختلفة**، والـbackend هو الذي يخزن كلمات المرور كـhashes مشفرّة/مُشتقة، وليس كلمات المرور نفسها. كذلك لا أستطيع إعطاءك كلمات مرور حقيقية جاهزة لحسابات خاصة؛ الأفضل أن يولّدها النظام عشوائيًا عند تهيئة الـBeta.

هذا هو **البروبمت النهائي للتطوير**، ومصمم ليعطي Copilot/AI أمر تنفيذ وليس مجرد أفكار:

```text
TAAMEN 2.0 BETA — FINAL UI/UX, RESPONSIVE, TACTICAL RADAR,
NAVIGATION, PROFILE, SETTINGS, PRIVATE CIRCLE AND VISUAL POLISH PASS

IMPORTANT:
This is a refinement and stabilization pass over the existing TAAMEN 2.0 BETA.

DO NOT throw away working functionality.
DO NOT rebuild unrelated systems from scratch.
DO NOT remove existing working features unless this specification explicitly asks for their removal or relocation.

First inspect the entire current repository and understand:
- current architecture
- routing
- components
- styles
- responsive behavior
- Match Center
- Archive
- Tactical Radar
- Profile
- Settings
- Public mode
- Private Circle
- Owner/Admin
- EmailJS
- notifications
- PWA
- IndexedDB
- backend
- legacy data
- existing migrations

Then implement this specification carefully.

============================================================
01 — PRIMARY OBJECTIVE
============================================================

The objective is to make TAAMEN 2.0 BETA feel like a finished,
premium football platform rather than a collection of functional pages.

Improve:

- visual hierarchy
- spacing
- cards
- forms
- inputs
- buttons
- navigation
- mobile UX
- desktop UX
- tactical radar
- profile
- settings
- loading states
- empty states
- error states
- animations
- colors
- typography
- date/time presentation
- responsive behavior
- sidebar behavior
- opening screen
- public/private selection
- Private Circle login
- sharing
- general consistency

Do not merely change colors.

Improve the actual interaction model.

============================================================
02 — DESIGN PRINCIPLE
============================================================

TAAMEN must feel like ONE coherent football product.

It must NOT look like:
- a generic admin dashboard
- an insurance website
- a banking interface
- a generic SaaS template
- a collection of unrelated cards

The football identity must remain obvious.

Use the TAAMEN design language consistently.

Primary colors:

#193940
#BAC8D9
#9BF272
#7ABF5A

Use:
- deep teal foundation
- blue-gray secondary surfaces
- lime action elements
- green supporting accents
- subtle gradients
- controlled glow
- translucent surfaces where useful
- soft borders
- modern rounded geometry
- strong spacing
- clean typography

Do not overuse glassmorphism.

============================================================
03 — OFFICIAL LOGO
============================================================

The product owner will provide the official TAAMEN logo image.

When the image is provided:

USE THAT EXACT LOGO.

Do not recreate it.
Do not replace it with an invented SVG.
Do not generate a different symbol.

Create one centralized branding asset.

Use it consistently in:
- opening screen
- sidebar
- header
- profile/share cards
- match share images
- notifications where appropriate
- PWA branding
- loading states
- empty states
- Private Circle
- Owner panel

The logo must be displayed using:
- correct aspect ratio
- contain behavior where appropriate
- intelligent masking
- no distortion
- no accidental cropping

============================================================
04 — OPENING SCREEN
============================================================

Reevaluate the current opening/splash screen.

Do not keep an opening screen merely because it exists.

If the splash screen delays useful interaction:
REMOVE or drastically shorten it.

Preferred behavior:

TAAMEN logo
+
very subtle branding animation
+
fast transition
+
application ready

The splash should never feel like a loading advertisement.

Target:
as close to instant as technically practical.

If the app is already loaded:
do not show a long splash again.

============================================================
05 — FIRST ENTRY EXPERIENCE
============================================================

Improve the first-time experience.

The first screen should clearly explain that TAAMEN offers:

PUBLIC / LOCAL EXPERIENCE

and

PRIVATE CIRCLE

Use two visually strong but compact options.

Example:

TAAMEN

Choose your experience

[ Public / Local ]
Use TAAMEN locally, create matches,
tactics and share football information.

[ Private Circle ]
Access the private team environment,
player data, history and statistics.

Do not make this look like a boring login page.

Make the two options visually distinct
but still part of the same TAAMEN system.

============================================================
06 — PUBLIC ENTRY
============================================================

Public entry should be frictionless.

No password.

No mandatory email.

No forced account creation.

Public users enter directly into the public/local experience.

============================================================
07 — PRIVATE ENTRY
============================================================

Private Circle requires authentication.

Use:

Name / Member
Password

The member names are:

Omar / عمر
Hani / هاني
Kareem / كريم
Mohammad Ali / محمد علي
Moamen / مؤمن
Ibrahim / ابراهيم
Arqam / ارقم
Moayad / مؤيد

The UI must support both Arabic and English names.

============================================================
08 — PRIVATE CIRCLE AUTHENTICATION
============================================================

IMPORTANT SECURITY REQUIREMENT:

Each of the 8 members must have a DIFFERENT password.

Do NOT use one shared password.

Members:

1. Omar
2. Hani
3. Kareem
4. Mohammad Ali
5. Moamen
6. Ibrahim
7. Arqam
8. Moayad

Each member has:
- unique member ID
- unique login identifier
- unique password

Passwords must NEVER be stored in plaintext.

============================================================
09 — PASSWORD STORAGE
============================================================

Store passwords only as secure password hashes.

Use a strong password hashing algorithm such as:

scrypt
Argon2id
or another modern memory-hard password hashing mechanism.

The preferred implementation for the current backend:
scrypt or Argon2id.

Never:
- store plaintext passwords
- store passwords in frontend JavaScript
- store passwords in localStorage
- store passwords in IndexedDB
- commit passwords to Git
- put passwords in public JSON
- expose passwords through API responses

Environment variables may be used for initial Beta provisioning,
but passwords must be hashed before persistent storage.

============================================================
10 — INITIAL BETA CREDENTIAL PROVISIONING
============================================================

Do NOT invent or hardcode publicly visible passwords.

Create a secure provisioning mechanism.

For example:

npm run seed:private

or:

npm run create:members

The provisioning tool generates secure random temporary passwords.

It should output them ONCE to the administrator.

After that:
only password hashes remain in persistent storage.

The administrator can replace passwords later.

Do not print passwords during normal server startup.

============================================================
11 — PRIVATE MEMBER LOGIN
============================================================

Private login UX:

TAAMEN Private Circle

Select Member
[ Omar ▼ ]

Password
[ ******** ]

[ Enter Private Circle ]

Add:
- loading state
- error state
- lock/rate-limit state
- session state

Do not reveal sensitive authentication details.

============================================================
12 — PRIVATE SESSION
============================================================

After successful authentication:

Use secure session cookies.

Cookie:
- HttpOnly
- Secure in production
- SameSite appropriate to deployment
- expiration
- server-side session validation

Do not store authentication tokens in localStorage.

============================================================
13 — RATE LIMITING
============================================================

Protect Private Circle login against brute force.

Implement:
- rate limiting
- temporary cooldown
- repeated-failure protection
- IP/session-aware controls where appropriate

Do not permanently lock the entire circle because one person enters the wrong password.

============================================================
14 — SIDEBAR / HAMBURGER
============================================================

Improve desktop and mobile navigation.

Collapsed sidebar:

Only:
- hamburger
- essential icons

Expanded sidebar:

TAAMEN logo
+
TAAMEN name
+
navigation labels
+
icons

When the hamburger is clicked:
expand the sidebar smoothly.

When close/collapse is clicked:
the TAAMEN name and expanded labels disappear,
while the compact logo/icon state remains.

The sidebar should feel like it folds,
not like the entire page changes.

============================================================
15 — SIDEBAR ANIMATION
============================================================

Use smooth animation for:

expanded width
opacity
label appearance
icon alignment

Do not animate expensive layout properties unnecessarily.

Prefer:
transform
opacity
width where unavoidable

Respect prefers-reduced-motion.

============================================================
16 — MOBILE NAVIGATION
============================================================

This is a critical requirement.

The mobile navigation must expose ALL relevant pages,
not only a small hardcoded subset.

Do NOT limit the bottom navigation to:
Home
Matches
Radar
Profile

while hiding everything else.

The user must be able to access all available pages.

============================================================
17 — MOBILE NAVIGATION MODEL
============================================================

Use a bottom navigation system.

Show the most important destinations directly.

Add:

More / Menu

When pressed:
expand a bottom sheet or navigation drawer containing the remaining pages.

Example:

Home
Matches
Radar
Archive
Profile
More

More:

AI
Players
Statistics
Readiness
Weather
Prayer
Qibla
Security
Settings
Guide
About
etc.

The exact list must be generated from the actual route registry,
not hardcoded separately.

============================================================
18 — SWIPE NAVIGATION
============================================================

Where appropriate, support horizontal swipe gestures
for navigation between primary mobile sections.

Do NOT make every page swipe unpredictably.

Use swipe only where it improves navigation.

Navigation must remain accessible with buttons.

============================================================
19 — MOBILE FULL-SCREEN PRINCIPLE
============================================================

On phones, do not simply make desktop pages narrower.

Recompose the interface for mobile.

Use:
- full available width
- correct safe areas
- comfortable touch targets
- bottom navigation
- compact headers
- stacked cards
- horizontal carousels where useful
- full-width controls

Avoid:
- tiny desktop cards squeezed into mobile
- huge empty margins
- horizontal overflow
- accidental page width expansion

============================================================
20 — TACTICAL RADAR MOBILE
============================================================

Tactical Radar is the main exception.

It should support an intentional horizontal/full-screen tactical mode.

When activated:

PORTRAIT
→
smooth transition
→
LANDSCAPE TACTICAL WORKSPACE

The tactical field should use essentially the entire available screen.

Do NOT create a narrow horizontal card inside the portrait page.

The field should visually become the main screen.

============================================================
21 — TACTICAL EXIT
============================================================

Add a small floating exit button.

It must:
- remain visible
- not cover players
- respect safe areas
- have a clear close/back icon
- return to the previous tactical layout

The button should be visually subtle.

============================================================
22 — DESKTOP TACTICAL FULLSCREEN
============================================================

On desktop:
provide a focus/fullscreen tactical mode.

The field expands significantly.

Use:
- large pitch
- minimal controls
- floating control layer
- small exit button

Do not force the entire browser into fullscreen unless explicitly supported and requested.

============================================================
23 — TACTICAL OPERATIONS PANEL
============================================================

Current problem:

The operations/player information panel appears to the RIGHT of the field.

Change this.

The operations panel must be moved BELOW the tactical pitch.

New structure:

--------------------------------
|                              |
|          FOOTBALL FIELD      |
|                              |
--------------------------------
|      OPERATIONS / PLAYER     |
|         INFORMATION          |
--------------------------------

This applies to the main tactical layout.

The field should become the primary visual element.

============================================================
24 — OPERATIONS PANEL CONTENT
============================================================

The bottom operations panel may contain:

Selected player
Player role
Position
Instructions
Captain
Team
Formation
Undo
Redo
Reset
Save
Share

Keep it compact.

Do not turn it into a giant form.

============================================================
25 — TACTICAL PLAYER INSPECTOR
============================================================

When a player is selected:
show a floating/attached player inspector.

The inspector must not permanently occupy the field.

Fields:
- player name
- position
- role
- instruction
- captain
- team

Public:
Player 1–5

Private:
authorized player identity may be used.

============================================================
26 — TACTICAL DRAGGING
============================================================

Player movement must be genuinely interactive.

Use:
Pointer Events

Support:
- mouse
- touch
- stylus

Interaction:

press
hold
drag
release

Do NOT require numeric coordinate inputs.

Players must move freely inside valid field boundaries.

============================================================
27 — TACTICAL DRAG PERFORMANCE
============================================================

Dragging must be low-latency.

Do not cause:
- React rerender storms
- layout thrashing
- pointer lag
- page scrolling during tactical dragging

Use:
- requestAnimationFrame where useful
- local interaction state
- pointer capture
- transformed positioning

Prevent page scroll while actively dragging inside the field.

============================================================
28 — TACTICAL FIELD DESIGN
============================================================

Redesign the pitch.

It must clearly resemble a real 5v5 football pitch.

Include correctly positioned:
- outer boundary
- center line
- center circle
- penalty areas
- goal areas where appropriate
- goals
- penalty spots where applicable
- corner arcs where appropriate

Keep dimensions internally consistent.

Do not draw decorative lines that do not correspond to actual pitch geometry.

============================================================
29 — TACTICAL PLAYER VISUALS
============================================================

Players should look like tactical markers,
not generic HTML circles.

Improve:
- player marker
- number/name
- selected state
- captain indicator
- team distinction
- role indicator
- shadow
- touch target

Use accessible contrast.

============================================================
30 — CAPTAIN INDICATOR
============================================================

Captain indicator should be a tasteful star/badge.

It should be:
- visible
- larger than before
- not oversized
- not blocking the player name

Animate selection subtly.

============================================================
31 — FORMATIONS MUST ACTUALLY WORK
============================================================

This is critical.

A formation option must NOT be cosmetic.

Selecting:

Diamond 1-2-1

must actually place the five players
in a diamond formation.

Example conceptual structure:

        P1

    P2      P3

        P4

        P5

Adapt according to the tactical coordinate system.

Similarly:

2-2
1-2-1
2-1-1
1-1-2
other supported formations

must produce correct coordinates.

============================================================
32 — FORMATION ENGINE
============================================================

Create one authoritative formation configuration.

Example conceptual model:

formation:
{
  id,
  name,
  playerSlots,
  coordinates
}

Do NOT implement formations by changing CSS classes only.

Formation selection must update the tactical state.

============================================================
33 — FORMATION VALIDATION
============================================================

When a formation is selected:

validate:
- exactly 5 players
- valid coordinates
- inside field boundaries
- no impossible overlap
- goalkeeper position where required
- team orientation

If a formation cannot be represented:
show an appropriate error.

Do not silently display a wrong formation.

============================================================
34 — FORMATION ANIMATION
============================================================

When switching formations:
players smoothly animate into the new positions.

Do not teleport them unless:
- reduced motion is enabled
- animation is disabled
- initialization is occurring

============================================================
35 — TACTICAL SAVE
============================================================

Save tactical state appropriately.

Public:
IndexedDB/local state

Private:
backend authoritative state
with optional local cache

Do not store large tactical datasets in localStorage.

============================================================
36 — GENERAL CARD SYSTEM
============================================================

Perform a global card audit.

Cards should:
- have consistent radius
- consistent padding
- clear hierarchy
- appropriate spacing
- meaningful content density

When several related cards exist:
place them beside each other when screen width allows.

If not:
stack them naturally.

Do NOT force everything into one vertical column.

============================================================
37 — RESPONSIVE CARD GRID
============================================================

Use responsive grids.

Example:

Desktop:
4 cards
3 cards
2 cards

Tablet:
2 cards

Mobile:
1 card
or controlled horizontal scroll for special collections

Avoid:
- giant cards
- excessive empty space
- cards with tiny content
- cards wider than viewport

============================================================
38 — FORMS
============================================================

Improve every form in the application.

Do not use:
huge empty white rectangles.

Every input should have:
- label
- meaningful placeholder
- current value where applicable
- helper text when needed
- validation
- error state
- focus state

Inputs must match TAAMEN design.

============================================================
39 — SETTINGS INPUTS
============================================================

Settings must look like actual controls.

Examples:

Notifications
[ Enabled ]

Language
[ العربية ]

Theme
[ System ]

Email
[ example@email.com ]

Privacy
[ Manage ]

Do not show blank fields without explanation.

============================================================
40 — BUTTON SYSTEM
============================================================

Create a consistent button hierarchy.

Primary:
lime emphasis

Secondary:
teal/blue-gray

Ghost:
transparent

Danger:
clearly differentiated

Icon-only:
for compact actions

Every icon-only button must have:
- tooltip where appropriate
- aria-label
- sufficient touch target

============================================================
41 — CLOSE BUTTONS
============================================================

Improve all close buttons.

Avoid:
tiny ambiguous X icons
random positioning
buttons touching screen edges

Use consistent placement.

Modals:
top-right in LTR
top-left in RTL

Respect logical direction.

============================================================
42 — BACK BUTTONS
============================================================

Back buttons should behave consistently.

Use:
- browser history where appropriate
- route-aware fallback
- logical RTL/LTR icon direction

Do not create a different back behavior on every page.

============================================================
43 — DATE DISPLAY
============================================================

Improve match date presentation.

Do not display only:

19/09/2026

Instead use a richer hierarchy.

Example:

Friday
19 September 2026
19:00

or Arabic equivalent:

الجمعة
19 سبتمبر 2026
19:00

Date above/primary.
Time directly below or beside it depending on card layout.

The weekday must be derived automatically.

============================================================
44 — MATCH DATE/TIME
============================================================

For match cards show:

DAY
DATE
TIME

Example:

FRIDAY
19 SEP 2026
19:00

Do not make the weekday manually editable.

Timezone must be handled consistently.

============================================================
45 — MATCH CARD VISUALS
============================================================

Improve match cards.

They should feel like football match cards.

Include:
- teams
- match state
- date
- time
- stadium
- city
- match type
- share action

Use appropriate visual hierarchy.

============================================================
46 — ARCHIVE CARD VISUALS
============================================================

Archive cards should feel historical and sports-related.

Show:
- result
- teams
- date
- stadium
- type

Private archive may additionally show:
- player statistics
- rankings
- tactical snapshot
- detailed performance

Public archive must not show private historical data.

============================================================
47 — PUBLIC ANALYSIS REMOVAL
============================================================

Remove the Analysis page from the PUBLIC experience.

Do not show:
Analysis
in:
- public navigation
- public dashboard
- public bottom navigation
- public route menu

If Analysis is required privately:
keep it PRIVATE ONLY.

============================================================
48 — PUBLIC VS PRIVATE ROUTE REGISTRY
============================================================

Do not maintain public and private navigation manually.

Create route metadata:

id
path
label
icon
scope
mobilePriority
desktopPriority
requiresAuth

Example:

scope:
PUBLIC
PRIVATE
OWNER

The navigation system should derive available pages
from this registry.

============================================================
49 — PRIVATE ANALYSIS
============================================================

Private Analysis may contain:
- player performance
- team performance
- historical trends
- match analysis
- tactical analysis

It must require Private Circle authorization.

============================================================
50 — PROFILE PAGE
============================================================

Create a dedicated Profile page.

Do not mix all profile settings into general Settings.

Profile page contains only profile-related information.

============================================================
51 — PROFILE HEADER
============================================================

Profile:

Banner / Cover
↓
Circular Avatar
↓
Full Name
↓
Bio
↓
Edit Profile

Use a polished overlap.

Avatar must:
- be circular
- preserve image
- support cover/crop
- support object-position
- never stretch

============================================================
52 — PROFILE BANNER
============================================================

Allow the user to upload a banner image.

Add:

Change Banner
Upload Banner

The banner should:
- support wide images
- crop intelligently
- preview before saving
- preserve important subject areas where possible
- never distort
- work on desktop and mobile

If no banner exists:
use a subtle TAAMEN gradient fallback.

============================================================
53 — PROFILE AVATAR
============================================================

Allow:

Upload Photo
Change Photo
Remove Photo

Use:
- preview
- crop/position
- contain/cover choice where appropriate

For normal avatar:
prefer cover with intelligent positioning.

Never stretch the image.

============================================================
54 — PROFILE EDIT FIELDS
============================================================

Profile page supports:

First Name
Family Name
Phone
Email
Bio
Profile Photo
Banner

All changes save locally for public profiles.

Private profile changes follow private permissions.

============================================================
55 — PROFILE EMAIL
============================================================

Email remains optional for Public Mode.

If absent:

Email
Not added

[ Add Email ]

If present:

Email
example@email.com

[ Change ]

Do not force email.

============================================================
56 — SETTINGS PAGE
============================================================

Create a dedicated Settings page.

Move non-profile controls here.

Settings may contain:

Appearance
Language
Notifications
Privacy
Cookies
Email preferences
Sharing
Storage
PWA
Accessibility
Motion
Data
Security
About

Profile editing must NOT be duplicated here.

============================================================
57 — SCREENSHOT WALLET
============================================================

Hide Screenshot Wallet from the main navigation.

Move it into:

Settings
→ Storage / Screenshots

The wallet remains functional.

Do not delete the feature.

============================================================
58 — SCREENSHOT WALLET UI
============================================================

Inside Settings:

Screenshot Wallet

Show:
- screenshot count
- storage usage
- recent captures
- manage
- delete
- share

Use a compact grid.

============================================================
59 — NOTIFICATIONS
============================================================

Notification center remains accessible through the notification icon.

Click:
notification icon

opens:
notification panel/center.

Include:
- unread count
- mark read
- mark all
- clear
- notification toggle

============================================================
60 — GENERAL PAGE HEADER
============================================================

Each page should have a consistent header:

Back / navigation
Title
Subtitle if needed
Actions

Do not randomly place page titles.

============================================================
61 — MOBILE PAGE HEADERS
============================================================

Mobile headers must remain compact.

Do not waste half the screen with headers.

Use:
- back
- title
- optional action

============================================================
62 — PUBLIC PROFILE SHARING
============================================================

Public profile can be shared.

Flow:

Profile
→ Share
→ Preview
→ Generate Link

Share link must contain only public-safe data.

Never expose:
- private settings
- phone by default
- email by default
- private statistics
- internal IDs
- passwords

============================================================
63 — MATCH SHARING
============================================================

Match sharing remains.

Generate:
- link
- image
- native share

The visual output must be significantly improved.

============================================================
64 — MATCH SHARE IMAGE
============================================================

Create polished share templates.

Upcoming
Friendly
Normal
Competitive
Tournament
Archive

Each should have:
- TAAMEN branding
- football visual language
- date
- weekday
- time
- stadium
- city
- match type
- result where appropriate

Do not create a generic ugly screenshot of the webpage.

Generate a proper share card.

============================================================
65 — SHARE IMPORT
============================================================

When recipient opens a shared match:

show preview

then:

[ Add to My TAAMEN ]

After confirmation:
save to local storage/IndexedDB.

Do not silently modify data.

============================================================
66 — SHARE PAYLOAD
============================================================

Shared payload must be:
- versioned
- validated
- sanitized
- size-limited
- public-safe

Never put:
passwords
private data
private statistics
private player data

into share payloads.

============================================================
67 — EMAILJS
============================================================

Use the existing EmailJS configuration:

Service:
service_13mkb9h

Contact template:
template_jsugxta

Auto Reply:
template_4pj4xlm

Do not invent another template.

============================================================
68 — EMAILJS CONTACT FLOW
============================================================

Contact Us:

If profile email exists:
prefill it.

If not:
show email field.

Send:
service_13mkb9h
+
template_jsugxta

Then use:
template_4pj4xlm

for the auto-reply where the template is configured to send to the user's email.

Show:
sending
success
failure
retry

Never show success before EmailJS actually confirms the request.

============================================================
69 — EMAIL VERIFICATION
============================================================

There is currently no confirmed verification template.

Do NOT invent one.

Keep verification configuration optional.

If a verification template is later configured:
support OTP verification.

Otherwise:
do not fake verification.

============================================================
70 — EMAIL SECURITY
============================================================

Do not treat EmailJS as authentication.

Email confirmation means:
the email automation was requested/sent.

It does NOT mean:
the user has a secure TAAMEN account.

============================================================
71 — PUBLIC DATA ISOLATION
============================================================

Public pages must not load private data.

Public should NOT load:
- old private archive
- best player
- private rankings
- private statistics
- private player names
- private analysis
- private tactical history

Do not simply hide private data with CSS.

Do not fetch it.

============================================================
72 — PRIVATE DATA LOADING
============================================================

Private data loads only after authentication.

Use lazy loading.

Public users should never download:
private statistics
private archive
private player datasets
owner tools

============================================================
73 — LAZY ROUTES
============================================================

Lazy-load feature pages.

Examples:

Home
Matches
Radar
Archive
Profile
Settings
AI
Analysis
Statistics
Readiness
Weather
Prayer
Qibla
Security
Control Center

Do not load every feature at startup.

============================================================
74 — AI
============================================================

AI remains:
EXPERIMENTAL / BETA.

Clearly label it.

Do not present it as infallible.

Load AI lazily.

Do not load AI resources on initial public entry.

============================================================
75 — PWA
============================================================

Maintain PWA support.

Service worker should:
- cache shell
- cache necessary static assets
- cache feature chunks after use where appropriate

Do not precache huge private feature datasets.

Do not cache private API responses publicly.

============================================================
76 — RESPONSIVE BREAKPOINT AUDIT
============================================================

Test:

320px
360px
375px
390px
414px
480px
768px
1024px
1280px
1440px
1920px

Fix:
- horizontal overflow
- clipped text
- broken cards
- oversized buttons
- modal overflow
- navigation overflow
- tactical overflow

============================================================
77 — TOUCH TARGETS
============================================================

All mobile controls should have comfortable touch targets.

Especially:
- hamburger
- back
- close
- notification
- share
- tactical controls
- player markers

Do not make critical controls microscopic.

============================================================
78 — ACCESSIBILITY
============================================================

Add:
- aria-labels
- keyboard navigation
- focus states
- semantic HTML
- sufficient contrast
- reduced motion

Do not rely on color alone.

============================================================
79 — REDUCED MOTION
============================================================

Respect:

prefers-reduced-motion

Disable or reduce:
- large transitions
- player movement animation
- splash animation
- sidebar animation
- floating motion

The application remains fully functional.

============================================================
80 — LOADING STATES
============================================================

Every async area needs a useful loading state.

Avoid:
blank white page.

Use:
- skeleton
- subtle loader
- contextual message

============================================================
81 — EMPTY STATES
============================================================

Do not show:
"Nothing here"

Instead explain what can be done.

Example:

No public matches yet.

Create your first match to get started.

[ Create Match ]

============================================================
82 — ERROR STATES
============================================================

Errors must be user-friendly.

Do not expose:
stack traces
raw API errors
technical internals

Use:
- title
- explanation
- retry
- back

============================================================
83 — COLORS
============================================================

Increase color clarity.

The lime:

#9BF272

should represent:
- primary actions
- active states
- important highlights

The deep teal:

#193940

should anchor:
- navigation
- backgrounds
- major surfaces

Blue-gray:

#BAC8D9

supports:
- secondary surfaces
- muted content
- information

Green:

#7ABF5A

supports:
- success
- football-related secondary highlights

Do not use lime everywhere.

============================================================
84 — TYPOGRAPHY
============================================================

Create a consistent type scale.

Titles:
strong

Section headings:
medium/semibold

Body:
comfortable

Metadata:
smaller but readable

Do not use excessive font sizes.

Arabic typography must be tested independently.

============================================================
85 — ARABIC RTL
============================================================

When Arabic:
- sidebar direction
- back icon
- modal alignment
- form alignment
- notification placement
- profile layout
- tactical controls

must behave correctly.

Do not simply reverse text alignment.

============================================================
86 — ENGLISH LTR
============================================================

When English:
restore normal LTR behavior.

No hardcoded Arabic directional assumptions.

============================================================
87 — LOCAL PROFILE STORAGE
============================================================

Public local profile:
IndexedDB.

Store:
- avatar blob
- banner blob
- profile fields
- preferences

Do not use localStorage for large images.

============================================================
88 — IMAGE OPTIMIZATION
============================================================

Uploaded:
avatar
banner
screenshots

should be processed appropriately.

Consider:
- resize
- compression
- WebP/AVIF where supported
- reasonable maximum dimensions

Do not allow a 20MB image to become the permanent profile asset.

============================================================
89 — DATA VALIDATION
============================================================

Validate:
- names
- email
- phone
- dates
- match times
- image sizes
- share payloads
- tactical coordinates

Do not trust frontend input.

Backend validates private data again.

============================================================
90 — PRIVATE MEMBER DATA
============================================================

Private members:

Omar
Hani
Kareem
Mohammad Ali
Moamen
Ibrahim
Arqam
Moayad

Store:
- unique ID
- display name
- optional Arabic name
- optional English name
- avatar
- role
- status
- password hash
- createdAt
- updatedAt

Never expose:
password hash
authentication secrets

============================================================
91 — OWNER
============================================================

Owner can:
- manage members
- reset member password
- activate/deactivate members
- manage private data
- manage matches
- manage players
- manage archive
- manage notifications
- inspect system

Password reset must invalidate existing sessions where appropriate.

============================================================
92 — PRIVATE PLAYER DATA
============================================================

Private players may map to:

Omar
Hani
Kareem
Mohammad Ali
Moamen
Ibrahim
Arqam
Moayad

Public tactical system must still default to:
Player 1
Player 2
etc.

============================================================
93 — PUBLIC/PRIVATE TACTICAL SEPARATION
============================================================

Public:
generic tactical identity.

Private:
authorized actual player identity.

Do not leak private names through:
- HTML
- API
- share links
- screenshots generated automatically
- metadata

============================================================
94 — MATCH DOMAIN
============================================================

Keep Match Center and Archive on one domain model.

Match contains:
- id
- teams
- date
- time
- weekday derived
- stadium
- city
- type
- status
- result
- visibility
- createdAt
- updatedAt

============================================================
95 — VISIBILITY
============================================================

Use:

LOCAL
PUBLIC
PRIVATE

LOCAL:
device-local

PUBLIC:
safe to share

PRIVATE:
Private Circle only

============================================================
96 — PUBLIC HOME
============================================================

Public Home must be clean.

Show:
- greeting
- local profile
- next public match
- quick create match
- tactical
- public archive
- notifications
- sharing

Do NOT show:
- Best Player
- old private archive
- private rankings
- private statistics
- private analysis

============================================================
97 — PRIVATE HOME
============================================================

Private Home may show:

- personal greeting
- rating
- ranking
- form
- next match
- readiness
- private archive
- team statistics
- tactical plan
- notifications
- analysis

============================================================
98 — PAGE DISCOVERY
============================================================

Every page should be discoverable from mobile.

Use:
primary bottom navigation
+
More sheet/drawer.

Do not leave pages inaccessible merely because they were not chosen for the first five navigation icons.

============================================================
99 — SETTINGS DISCOVERY
============================================================

Profile:
profile only.

Settings:
everything else.

Screenshot Wallet:
Settings.

Security:
Settings/private where appropriate.

============================================================
100 — PROFILE PAGE ACTIONS
============================================================

Profile actions:

Edit Profile
Share Profile
Change Photo
Change Banner

Do not clutter with:
theme
notifications
storage
security

Those belong to Settings.

============================================================
101 — SETTINGS PAGE ACTIONS
============================================================

Settings:

Language
Appearance
Notifications
Privacy
Cookies
Sharing
Email
Storage
Screenshot Wallet
Accessibility
Motion
Security
PWA
About

============================================================
102 — GENERAL VISUAL POLISH
============================================================

Perform a page-by-page visual audit.

Look for:
- uneven padding
- inconsistent radii
- inconsistent icon sizes
- random shadows
- oversized cards
- tiny controls
- empty spaces
- misaligned text
- broken RTL
- bad mobile stacking
- ugly form fields
- inconsistent buttons
- inconsistent modal sizes

Fix them globally using shared tokens/components.

============================================================
103 — DO NOT PATCH EACH PAGE SEPARATELY
============================================================

If five pages have bad buttons:
fix the shared Button component.

If five pages have bad cards:
fix the shared Card system.

If five pages have bad page headers:
fix the shared PageHeader.

Do not duplicate CSS fixes.

============================================================
104 — DESIGN TOKENS
============================================================

Create/maintain centralized tokens for:

colors
spacing
radius
shadow
typography
motion
z-index
breakpoints
surface opacity
borders

All pages should consume these tokens.

============================================================
105 — NAVIGATION STATE
============================================================

Navigation should know:
- current route
- current scope
- expanded/collapsed state
- mobile menu state
- authentication state
- available routes

Avoid multiple conflicting navigation systems.

============================================================
106 — SIDEBAR STATE PERSISTENCE
============================================================

Desktop:
optionally remember collapsed/expanded state locally.

Mobile:
always use mobile navigation behavior.

Do not persist a desktop sidebar width into mobile.

============================================================
107 — MODALS
============================================================

All modals:
- centered/appropriate
- responsive
- scroll internally when necessary
- close button
- keyboard escape
- focus management
- RTL-aware

Never let a modal exceed the viewport.

============================================================
108 — BOTTOM SHEETS
============================================================

Mobile:
use bottom sheets for:
- More menu
- share actions
- tactical controls
- quick actions

They should:
- animate from bottom
- have drag/close affordance where useful
- respect safe area

============================================================
109 — SHARE UX
============================================================

Share action should open:

Share

[ Copy Link ]
[ Share ]
[ Generate Image ]

not a giant modal.

============================================================
110 — MATCH SHARE PREVIEW
============================================================

Before generating an image:
show a proper preview.

User can:
- choose template
- preview
- generate
- share
- save

============================================================
111 — DATE/TIME LOCALIZATION
============================================================

Use locale-aware date formatting.

Arabic:
Arabic weekday/month names where appropriate.

English:
English weekday/month names.

Time:
24-hour format unless product settings explicitly support otherwise.

============================================================
112 — PALESTINE TIMEZONE
============================================================

Use the existing TAAMEN timezone strategy consistently.

Do not calculate weekday from client locale alone if match data has an authoritative timezone.

============================================================
113 — FOOTBALL IDENTITY
============================================================

Strengthen football visual cues through:
- pitch geometry
- tactical markers
- match cards
- competition types
- score/result hierarchy
- football icons
- tactical terminology

Do not overdo decorative football graphics.

============================================================
114 — LEGACY DATA
============================================================

Do not fabricate legacy statistics.

Use actual existing TAAMEN data.

Legacy private data:
PRIVATE scope.

Public:
does not receive it automatically.

============================================================
115 — SECURITY PAGE
============================================================

Security page remains available in the correct scope.

Public:
general security/privacy information.

Private:
private security/session information where appropriate.

Owner:
system security controls.

============================================================
116 — AI PAGE
============================================================

AI:
Experimental / Beta

Show this clearly.

Keep AI lazy-loaded.

Do not allow AI to expose private data to public users.

Private AI can use authorized private context only.

============================================================
117 — PERFORMANCE
============================================================

Target:
fast initial load.

Initial public bundle should contain only:
- shell
- route registry
- locale
- theme
- public route requirements

Do not initialize:
- AI
- private statistics
- admin
- private archive
- heavy tactical analytics

until needed.

============================================================
118 — NO WHITE SCREEN
============================================================

If a feature fails:
the shell must remain visible.

Never allow one failed module
to blank the entire application.

Use error boundaries.

============================================================
119 — ERROR BOUNDARIES
============================================================

Feature-level error boundaries:

Radar
AI
Weather
Archive
Profile
Settings
Private Circle
Control Center

A failure in one should not destroy the entire application.

============================================================
120 — FINAL QA
============================================================

Test PUBLIC:

- first entry
- public selection
- home
- match center
- create match
- archive
- create archive
- tactical
- formations
- drag
- share
- import
- profile
- profile photo
- profile banner
- settings
- notifications
- EmailJS
- mobile navigation
- More menu
- RTL
- LTR

Test PRIVATE:

- member selection
- each of 8 member logins
- wrong password
- rate limiting
- session
- logout
- private home
- private archive
- statistics
- rankings
- analysis
- tactical
- real player identities
- notifications
- profile
- settings

Test OWNER:

- member management
- password reset
- sessions
- private data
- permissions

============================================================
121 — EIGHT MEMBER TEST MATRIX
============================================================

Test each member:

Omar
Hani
Kareem
Mohammad Ali
Moamen
Ibrahim
Arqam
Moayad

For each:
- correct password succeeds
- incorrect password fails
- session created
- member identity correct
- authorized private data loaded
- logout works

Do not expose passwords in test output.

============================================================
122 — MOBILE TEST MATRIX
============================================================

Test:
320
360
375
390
414
480

Verify:
- bottom navigation
- More menu
- profile
- settings
- forms
- match cards
- archive
- tactical landscape
- modal
- bottom sheet
- share preview

============================================================
123 — DESKTOP TEST MATRIX
============================================================

Test:
1024
1280
1440
1920

Verify:
- sidebar collapse
- sidebar expand
- cards beside each other
- tactical workspace
- operations panel below pitch
- profile
- settings
- notifications

============================================================
124 — TACTICAL ACCEPTANCE TEST
============================================================

Must pass:

1. Open Tactical.
2. Field is visually correct.
3. Select player.
4. Inspector appears.
5. Drag player.
6. Player moves smoothly.
7. Player cannot leave field.
8. Select Diamond.
9. Five players reposition into actual diamond coordinates.
10. Select another formation.
11. Players reposition accordingly.
12. Undo.
13. Redo.
14. Save.
15. Reload.
16. Formation/state remains correct.
17. Mobile landscape mode works.
18. Exit button works.
19. Operations panel is BELOW the field.

============================================================
125 — FINAL UX RULE
============================================================

Every interaction should answer:

"What does this control do?"

Avoid mystery buttons.

Use:
- labels where needed
- icons where obvious
- tooltips where useful
- confirmation for destructive actions

============================================================
126 — FINAL PRODUCT RULE
============================================================

Do not optimize for “technically implemented”.

Optimize for:

FAST
CLEAR
BEAUTIFUL
FOOTBALL-FIRST
RESPONSIVE
PRIVATE WHEN NEEDED
LOCAL WHEN APPROPRIATE
ACCESSIBLE
MAINTAINABLE

============================================================
127 — FINAL SCOPE RULE
============================================================

PUBLIC:

Clean
Local
Simple
Shareable
Football-focused

PRIVATE:

Deep
Personal
Historical
Statistical
Tactical

OWNER:

Administrative
Operational
Secure

All three:
SAME TAAMEN.

============================================================
128 — FINAL EXECUTION INSTRUCTION
============================================================

Before editing:

1. Inspect current repository.
2. Map current components.
3. Identify duplicated styles.
4. Identify broken responsive layouts.
5. Identify current tactical architecture.
6. Identify current routing.
7. Identify current public/private separation.
8. Identify EmailJS integration.
9. Identify profile storage.
10. Identify private authentication.

Then implement.

Do not blindly overwrite existing files.

Prefer:
- shared components
- reusable hooks
- centralized tokens
- route metadata
- feature boundaries
- typed domain models

After implementation:
run:
- typecheck
- lint
- build
- tests

Fix all build/runtime errors.

Verify GitHub Pages compatibility for the public/static portion.

Verify backend configuration separately.

============================================================
129 — IMPORTANT FINAL SECURITY NOTE
============================================================

Private member passwords are credentials.

Never expose them:
- in frontend source
- in GitHub
- in README
- in screenshots
- in API responses
- in client logs
- in browser storage

Generate them securely during provisioning.

Store only password hashes.

If the owner needs to know the initial passwords,
provide them only through the secure provisioning command
at setup time.

============================================================
130 — FINAL RESULT
============================================================

The finished TAAMEN 2.0 BETA should feel like a polished,
real football platform.

The first-time user sees a clean TAAMEN entry experience.

The Public user gets:
- local football workspace
- matches
- archive
- tactical board
- generic players
- profile
- sharing
- settings

The Private member gets:
- real private identity
- personal dashboard
- actual players
- historical archive
- rankings
- statistics
- analysis
- private tactics
- readiness
- notifications

The Owner gets:
- complete management capabilities

The interface remains ONE TAAMEN.

Do not make three different websites.

Do not sacrifice usability for complexity.

Do not sacrifice security for convenience.

Do not expose private data.

Do not fake functionality.

Do not leave pages inaccessible on mobile.

Do not leave the tactical formation as a visual-only selector.

Do not leave the operations panel beside the pitch.

Move it below the pitch.

Make the tactical field the visual centerpiece.

Make the profile and settings proper standalone pages.

Make the sidebar collapse elegantly.

Make the mobile navigation expose every available page.

Make the entire product feel intentional.
```

**ملاحظة مهمة بخصوص كلمات المرور:** خلي الـAI ينشئ الـ8 حسابات بهذه الأسماء، لكن **لا تطلب منه أن يضع كلمات المرور داخل الكود أو يعطيك كلمات ثابتة داخل المشروع**. الأفضل أن يكون عندك أمر provisioning يولّد 8 كلمات عشوائية قوية ويعرضها لك مرة واحدة، ثم يُخزّن فقط الـhash. هيك لو رفعت المشروع على GitHub ما بتكون عندك مصيبة أمنية بسبب credentials داخل المستودع.

والنتيجة المقصودة تحديدًا في الرادار:

```text
┌──────────────────────────────────────────┐
│                                          │
│              FOOTBALL PITCH              │
│                                          │
│        ● P1              ● P2            │
│                                          │
│              ● P3                        │
│                                          │
│        ● P4              ● P5            │
│                                          │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ Selected Player                          │
│ Role • Position • Instructions           │
│                                          │
│ Undo   Redo   Formation   Save   Share   │
└──────────────────────────────────────────┘
```

وعلى الهاتف في وضع Tactical:

```text
┌──────────────────────────────────────────────┐
│                                      ×       │
│                                              │
│              FULL-WIDTH PITCH                │
│                                              │
│       ● P1                    ● P2           │
│                                              │
│                 ● P3                         │
│                                              │
│       ● P4                    ● P5           │
│                                              │
├──────────────────────────────────────────────┤
│ Player 3 • Midfielder • Captain              │
│      ↶    ↷    Formation    Save             │
└──────────────────────────────────────────────┘
```

وهذا بالضبط يعالج مشكلة **"على الجوال يصير طويل/عريض بشكل غريب"**: الصفحات العادية تكون **Full-width responsive**، بينما **الرادار وحده** يدخل في وضع أفقي حقيقي عندما يضغط المستخدم زر Tactical Focus/Landscape.

---

# 00.36 — MACHINE-READABLE FINAL CONTRACT

```yaml
product:
  name: TAAMEN
  version: 2.0 BETA
  model: public-first football platform with embedded private former-player circle

scopes:
  - PUBLIC_LOCAL
  - PRIVATE_CIRCLE
  - OWNER_ADMIN

public:
  account_required: false
  local_first: true
  user_created_matches: true
  user_created_archive: true
  public_safe_sharing: true
  private_data_fetch: false

email:
  provider: EmailJS-compatible
  contact_service: service_13mkb9h
  contact_template: template_jsugxta
  auto_reply_template: template_4pj4xlm
  verification_template: configurable_only
  verification_truth: OTP validated, not send-success

private_circle:
  member_count: 8
  individual_credentials_target: true
  shared_password_final_design: false
  server_authoritative: true
  secure_session_cookie: true
  rate_limited: true

storage:
  public_beta: IndexedDB
  private_beta: backend
  future_cloud: repository_adapter_and_sync

security:
  password_hashing: scrypt_or_argon2id
  plaintext_passwords: forbidden
  auth_tokens_in_browser_storage: forbidden
  public_private_isolation: server_and_domain_level

sharing:
  public_match: allowed
  private_match: rejected
  explicit_import_confirmation: required
  payload: versioned_validated_sanitized_size_limited

ai:
  status: experimental_beta
  public_context: public_only
  private_context: authorized_private_only
  initial_load: lazy

branding:
  compact_mark_source: TAAMEN-2.0-brand-mark.png
  redraw_source_mark: false

architecture:
  ui: React + TypeScript
  routing: one_registry
  persistence: repository_boundary
  shared_ui: tokenized_components
  heavy_features: lazy_loaded

non_negotiables:
  - do_not_fake_verification
  - do_not_expose_private_data
  - do_not_store_plaintext_passwords
  - do_not_copy_legacy_architecture
  - do_not_create_parallel_match_models
  - do_not_make_formation_ui_only
  - do_not_break_mobile_discoverability
  - do_not_blank_the_entire_app_on_feature_error
```
