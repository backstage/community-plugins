---
'@backstage-community/plugin-quay-backend': minor
'@backstage-community/plugin-quay-common': minor
'@backstage-community/plugin-quay': minor
---

**BREAKING**: Added support for multiple Quay instances. Backend plugin routes now require an `:instance` parameter to support multiple Quay instances:

- `/repository/:org/:repo/tag` → `/:instance/repository/:org/:repo/tag`
- `/repository/:org/:repo/manifest/{digest}` → `/:instance/repository/:org/:repo/manifest/{digest}`
- `/repository/:org/:repo/manifest/{digest}/labels` → `/:instance/repository/:org/:repo/manifest/{digest}/labels`
- `/repository/:org/:repo/manifest/{digest}/security` → `/:instance/repository/:org/:repo/manifest/{digest}/security`
