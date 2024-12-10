---
'@backstage-community/plugin-rbac-backend': minor
---

Roles and permissions were not correctly applied for users and groups with names containing uppercase letters. To address this issue, we now convert user and group references in all user inputs to lowercase. This change migrates `v0` column in `casbin_rule` table in `backstage_plugin_permission` database. Conditions containing claims with uppercase letters are not resolved yet.
