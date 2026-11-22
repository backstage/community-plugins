---
'@backstage-community/plugin-npm': patch
---

Added missing dependency on `@backstage/filter-predicates` and an optional peer dependency on `@types/react`, which the published types use, and added the `react-dom` and `react-router-dom` peer dependencies that its dependencies require. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
