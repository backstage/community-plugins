---
'@backstage-community/plugin-announcements-react': patch
---

Added missing dependencies on `@backstage/frontend-plugin-api` and `@types/luxon`, which the published types use, and added the `react-dom` and `react-router-dom` peer dependencies that its dependencies require. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
