---
'@backstage-community/plugin-rbac-backend': minor
'@backstage-community/plugin-rbac-common': minor
'@backstage-community/plugin-rbac': minor
---

Adds the ability to assign ownership to roles that can then be used to conditionally filter roles, permission policies, and conditional policies. The conditional filter can now be accomplished through the use of the new RBAC conditional rule `IS_OWNER`.

`IS_OWNER` can be used to grant limited access to the RBAC plugins where in admins might want leads to control their own team's access.
