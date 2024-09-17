---
'@backstage-community/plugin-bazaar-backend': minor
---

**BREAKING**: The backend has been migrated to the new backend system. The `createRouter` function now requires the new `auth` and `httpAuth` services to be passed in, instead of the removed `identity` service. If you are using the new backend system module, this does not affect you.
