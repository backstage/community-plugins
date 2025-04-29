---
'@backstage-community/plugin-rbac-backend': patch
'@backstage-community/plugin-rbac': patch
---

Fixed a bug where updating a role name via the `PUT </api/permission/roles/:kind/:namespace/:name>` endpoint did not propagate changes to metadata, permissions and conditions, leaving them mapped to the old role name.
