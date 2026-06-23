---
'@backstage-community/plugin-rbac': minor
'@backstage-community/plugin-rbac-backend': minor
'@backstage-community/plugin-rbac-common': minor
'@backstage-community/plugin-rbac-node': minor
---

Backstage version bump to v1.51.0.

The RBAC backend plugin now resolves user identity through Backstage's `UserInfoService` when evaluating conditional permissions, as part of aligning with the Backstage 1.51 permission framework. **No action is required** if you install RBAC with `backend.add(import('@backstage-community/plugin-rbac-backend'))` and manage access through app-config as documented.

If you extend RBAC at a lower level (for example by constructing `PolicyBuilder` directly), ensure `UserInfoService` is wired through your backend integration.
