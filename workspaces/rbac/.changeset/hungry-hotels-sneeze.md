---
'@backstage-community/plugin-rbac-backend': minor
---

Add support for a default role for authenticated users in RBAC backend

- Introduced a new `defaultRole` configuration option to assign a default role to all authenticated users.

  ```diff
  permission:
    rbac:
  +   defaultRole: role:default/my-default-role
  ```

- Updated the RBAC permission policy to include the default role in user roles if not already present.
