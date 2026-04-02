---
'@backstage-community/plugin-catalog-backend-module-keycloak': patch
---

Fixes group fetching to default to the recursive subgroup strategy when the Keycloak server version cannot be determined from `serverInfo`. Previously, the version check could silently produce an unexpected result if `systemInfo.version` was absent; now the plugin defaults to `processGroupsRecursively` for all versions except those explicitly detected as 22 or lower, which continue to use the flat `traverseGroups` approach.
