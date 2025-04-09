---
'@backstage-community/plugin-rbac-backend': minor
'@backstage-community/plugin-rbac-common': minor
'@backstage-community/plugin-rbac': minor
---

Adds the ability to assign ownership to roles that can then be used to conditionally filter roles, permission policies, and conditional policies. The conditional filter can now be accomplished through the use of the new RBAC conditional rule `IS_OWNER`.

`IS_OWNER` can be used to grant limited access to the RBAC plugins where in admins might want leads to control their own team's access.

Removed the resource type from the `policy.entity.create` permission to prevent conditional rules being applied to the permission. At the moment, the plugins will still continue to work as expected. However, it is strongly recommended updating all permission policies that utilize the resource type `policy-entity` with the action `create` (ex. `role:default/some_role, policy-entity, create, allow` to `role:default/some_role, policy.entity.create, create, allow`) to prevent any future degradation in service. A migration has been supplied to automatically update all permission policies that have not originated from the CSV file. The CSV file was skipped as a duplication event could happen during reloads / restarts. This means that the CSV file will need to be updated manually to ensure that all references to the old permission policy, resource type `policy-entity` with an action of `create`, have been updated to the named permission `policy.entity.create` with an action of `create`.
