---
'@backstage-community/plugin-rbac-backend': patch
---

Fixed a bug where updating a role name via the `PUT </api/permission/roles/:kind/:namespace/:name>` endpoint did not propagate changes to metadata and permissions, leaving them mapped to the old role name.
