---
'@backstage-community/plugin-copilot-backend': patch
---

Report downloads are now also allowed from the GHE.com tenant of the API base URL, so `copilot.host` can point at a dedicated `api.SUBDOMAIN.ghe.com` integration entry and still download reports from `copilot-reports.SUBDOMAIN.ghe.com`. This lets the Copilot token live apart from the GitHub App the rest of Backstage uses for `SUBDOMAIN.ghe.com`.
