---
'@backstage-community/plugin-rbac-backend': minor
'@backstage-community/plugin-rbac-common': minor
'@backstage-community/plugin-rbac': minor
---

Add support for a default role and permissions for authenticated users in RBAC backend

- Introduced a new `defaultRole` and `basicPermissions` configuration options to assign a default role to all authenticated users.

  ```diff
  permission:
    rbac:
  +   defaultPermissions:
  +     defaultRole: role:default/my-default-role
  +     basicPermissions:
  +       - permission: catalog.entity.read
  +         action: read
  +         effect: allow
  ```

- Updated the RBAC permission policy to include the default role in user roles if not already present.
