# TAAMEN Private Circle

The Beta Private Circle uses individual credentials for the authorized members. The login screen never displays a member list: the member types an Arabic or English name manually and enters their own password.

Passwords are provisioned on the backend only. `backend/data.json` stores password hashes, never plaintext passwords. For local Beta setup, `backend/.env` contains the initial per-member passwords and `npm run backend` loads it with Node `--env-file`. Change them before any real deployment and never commit `backend/.env`.

Authorized members:
- Omar / عمر — OWNER
- Hani / هاني — MEMBER
- Kareem / كريم — MEMBER
- Mohammad Ali / محمد علي — MEMBER
- Moamen / مؤمن — MEMBER
- Ibrahim / إبراهيم — MEMBER
- Arqam / أرقم — MEMBER
- Moayad / مؤيد — MEMBER

Private endpoints require an active server session. Frontend navigation alone is not an authorization boundary; the backend re-checks the session on every private request. Session expiry also returns the user to the access gate.
