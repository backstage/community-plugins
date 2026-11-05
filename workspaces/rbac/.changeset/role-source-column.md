---
'@backstage-community/plugin-rbac': minor
---

Show each role's source in the Roles list and disable Edit/Delete for roles not created via the REST API or UI

Roles now display a Source column (App Config, CSV, or Form). Edit and Delete are disabled for App Config and CSV roles, with a tooltip explaining that changes must be made in the corresponding source.

Also fix success toasts reappearing on page refresh after creating or updating a role.
