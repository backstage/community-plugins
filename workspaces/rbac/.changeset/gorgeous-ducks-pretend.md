---
'@backstage-community/plugin-rbac-backend': patch
---

Fixes an issue where the correct permission name was not selected while processing new conditional policies to be added. This scenario happens whenever a plugin exports multiple permissions that have different resource types but similar actions. What would end up happening is the first matched action would be the one selected during processing even though it was not the correct permission and used for the conditional policy. This problem has been fixed and now the correct permission name and action are selected.
