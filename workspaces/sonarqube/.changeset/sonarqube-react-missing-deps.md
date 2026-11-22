---
'@backstage-community/plugin-sonarqube-react': patch
---

Added missing dependency on `@backstage/frontend-plugin-api`, which the published types use. This fixes type errors with package managers that don't hoist dependencies, such as pnpm.
