---
'@backstage-community/plugin-rbac-backend': patch
---

`getFilteredPolicy` now accepts an array of filters and loads every match in one database query. This improves performance when several roles are checked together, including authorization, permission checks, policy listing, CSV policy cleanup, and applying permissions from an RBAC provider.
