---
'@backstage-community/plugin-rbac': minor
---

Added a read-only "Permissions by plugin" view to the RBAC page. It shows every role against the permissions of each plugin as Allow, Deny or Conditional, can be narrowed down by role, plugin and policy decision to compare a few roles side by side, and marks roles that are managed outside the UI (for example from app-config or a CSV file) as view-only.

The RBAC API gained a `getAllRoleConditions` method that lists the conditional policies of every role; `getRoleConditions` still takes the role reference it always did.
