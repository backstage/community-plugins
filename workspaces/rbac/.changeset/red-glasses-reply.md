---
'@backstage-community/plugin-rbac-backend': patch
---

Use loadPolicy to keep the enforcer in sync for edit operations. It should keep the RBAC plugin in sync when the Backstage instance is scaled to multiple deployment replicas. Reuse the maximum database pool size value from the application configuration in the RBAC Casbin adapter.
