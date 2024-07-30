---
'@backstage-community/plugin-tech-insights-backend': minor
---

Remove dependency to `backend-test-utils` in none test code.

**BREAKING**: From now on the `logger` must be provided, when using `initializePersistenceContext`.
