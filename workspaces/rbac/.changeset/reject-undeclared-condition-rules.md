---
'@backstage-community/plugin-rbac-backend': patch
---

Creating or updating a conditional policy through the REST API now rejects rules that the target plugin does not declare (`400`), instead of storing a condition that makes every later permission check for that resource type fail. If the plugin's permission metadata cannot be retrieved to verify the rules, the request fails with `503`.
