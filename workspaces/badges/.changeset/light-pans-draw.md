---
'@backstage-community/plugin-badges-backend': minor
---

**BREAKING** `httpAuth`, `auth`, and `config` are now required, please migrate to the new backend system as the best path forward for this change.

Removed usages and references of `@backstage/backend-common`

Deprecated `createRouter` and its router options in favour of the new backend system.
