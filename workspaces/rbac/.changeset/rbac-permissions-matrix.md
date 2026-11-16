---
'@backstage-community/plugin-rbac': minor
---

Added a read-only "Permissions by plugin" view to the RBAC page. It shows every role against the permissions of each plugin as Allow, Deny or Conditional, can be filtered by role name and plugin, and marks roles that are managed outside the UI (for example from app-config or a CSV file) as view-only.

The `getRoleConditions` method of the RBAC API now accepts an optional role reference and returns the conditional policies of all roles when it is omitted.
