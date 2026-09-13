# Security boundaries

1. Public profiles are local and have no password.
2. Private passwords are server-side only and are hashed with Node `scrypt` in the development backend.
3. Private sessions use an HttpOnly cookie in the development backend.
4. Owner actions check the role on the server.
5. Public share payloads include only sanitized match-safe fields.
6. Private data is not placed in public share payloads.
7. Frontend hidden buttons are not treated as security.
8. Production must replace the development JSON store with a managed database and production-grade session/rate-limit infrastructure.
