---
'@backstage-community/plugin-rbac-backend': patch
---

Fixes two issues that were impact the performance, the first was that we were individually adding and removing roles and the second was we were removing all policies and roles regardless of whether they should actually be removed.
