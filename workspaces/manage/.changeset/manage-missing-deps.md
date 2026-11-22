---
'@backstage-community/plugin-manage': patch
'@backstage-community/plugin-manage-module-tech-insights': patch
---

Added an optional peer dependency on `@types/react`, which the published types use. This fixes type errors with package managers that don't hoist dependencies, such as pnpm.
