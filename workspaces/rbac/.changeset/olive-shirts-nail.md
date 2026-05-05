---
'@backstage-community/plugin-rbac-backend': patch
---

Harden RBAC policy handling for Casbin CSV-style persistence: reject permission strings that contain double quotes at validation time; rethrow errors after auditing when a full policy reload fails so root causes are visible; parse the RBAC policy CSV line by line and skip malformed rows with warnings so one bad line no longer prevents the permission backend from starting, with matching skip-and-warn behavior when loading the same file into the temporary policy enforcer.
