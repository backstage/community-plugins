---
'@backstage-community/plugin-rbac-backend': minor
---

Added `conditionalPermissions` to `permission.rbac.defaultPermissions` so conditional permission policies can be configured for the default role. Entries are validated when the backend starts; applying them to permission decisions will follow in an upcoming release.
