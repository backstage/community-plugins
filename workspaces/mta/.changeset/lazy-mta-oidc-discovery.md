---
'@backstage-community/backstage-plugin-mta-backend': patch
---

The MTA backend no longer fails to start when MTA is unreachable. It now connects to the MTA identity provider on the first request that needs it, and retries on the next request if that fails.
