---
'@backstage-community/plugin-rbac-backend': patch
---

Evaluate the permissions for a superuser earlier in the process to avoid the unintended consequence of having conditional permissions policies applied to a superuser.
