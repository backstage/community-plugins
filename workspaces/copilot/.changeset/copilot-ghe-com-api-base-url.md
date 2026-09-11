---
'@backstage-community/plugin-copilot-backend': minor
---

Added support for GitHub Enterprise Cloud with data residency (GHE.com), including a new optional `copilot.apiBaseUrl` setting and a fix so GitHub App authentication targets the configured API host instead of always using `api.github.com`. Report downloads are now allowed from the configured `copilot.host` and its subdomains rather than a fixed list of `github.com` hosts, so GitHub Enterprise Server setups can download reports from their own instance too. An invalid `copilot.apiBaseUrl` is rejected on startup instead of silently falling back to the public GitHub API.
