---
'@backstage-community/plugin-search-backend-module-azure-devops': minor
---

Added support for non-PAT credentials (service principals, managed identities) via `DefaultAzureDevOpsCredentialsProvider` from `@backstage/integration`. The `token` config field is now deprecated in favor of `integrations.azure`. The `baseUrl` config field is now optional, defaulting to `https://dev.azure.com`.
