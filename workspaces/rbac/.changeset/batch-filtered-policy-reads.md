---
'@backstage-community/plugin-rbac-backend': patch
---

`getFilteredPolicy` and `getFilteredGroupingPolicy` now accept an array of filters and load matches in batches instead of one query per filter, avoiding database query limits when many filters are passed at once. This improves performance when several roles or members are checked together, including authorization, permission checks, policy listing, CSV policy cleanup, and applying roles and permissions from an RBAC provider.
