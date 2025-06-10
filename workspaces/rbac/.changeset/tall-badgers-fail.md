---
'@backstage-community/plugin-rbac-backend': major
---

**BREAKING**: Removal of the deprecated createRouter from @backstage/plugin-permission-backend. This results in a new requirement of having the permission plugin installed alongside the RBAC backend plugin.

Recent changes to the @backstage/plugin-permission-backend resulted in the deprecating and removal of `createRouter` which was primarily used as a way to start both the permission backend plugin and the RBAC backend plugin at the same time. This removal now results in the requirement of having the permission backend plugin installed separately to ensure that the RBAC backend plugin works accordingly.

Changes required to `packages/backend/src/index.ts`

```diff
// permission plugin
+ backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('@backstage-community/plugin-rbac-backend'));
```
