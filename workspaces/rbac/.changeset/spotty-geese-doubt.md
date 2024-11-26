---
'@backstage-community/plugin-rbac-backend': patch
---

Ensures that the permissions and roles are properly synced during request handling. This is important in high availability scenarios as we need to ensure data is up to date during scaling.
