---
'@backstage-community/backstage-plugin-mta-backend': patch
---

Defer OIDC issuer discovery until the first request that needs it, so the backend starts even when MTA is unreachable. A failed discovery is retried on the next request instead of being cached.
