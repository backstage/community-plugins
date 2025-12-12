---
'@backstage-community/plugin-quay-backend': minor
'@backstage-community/plugin-quay-common': minor
'@backstage-community/plugin-quay': minor
---

**BREAKING**: Added support for multiple Quay instances. Backend plugin routes now require an `:instance-name` parameter to support multiple Quay instances:

- `/repository/:org/:repo/tag` → `/:instanceName/repository/:org/:repo/tag`
- `/repository/:org/:repo/manifest/{digest}` → `/:instanceName/repository/:org/:repo/manifest/{digest}`
- `/repository/:org/:repo/manifest/{digest}/labels` → `/:instanceName/repository/:org/:repo/manifest/{digest}/labels`
- `/repository/:org/:repo/manifest/{digest}/security` → `/instanceName/repository/:org/:repo/manifest/{digest}/security`
