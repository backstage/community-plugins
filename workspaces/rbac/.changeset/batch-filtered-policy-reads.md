---
'@backstage-community/plugin-rbac-backend': patch
---

`getFilteredPolicy` and `getFilteredGroupingPolicy` now accept an array of filters and load every match in one database query. This improves performance when several roles or members are checked together, including authorization, permission checks, policy listing, CSV policy cleanup, and applying roles and permissions from an RBAC provider.
