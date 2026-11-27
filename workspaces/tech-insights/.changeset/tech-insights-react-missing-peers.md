---
'@backstage-community/plugin-tech-insights-react': patch
---

Declared `@types/react` as an optional peer dependency because the published types use React types, and added the missing `react-dom` and `react-router-dom` peer dependencies that its Backstage dependencies require. This fixes type errors and missing peer dependencies with package managers that don't hoist dependencies, such as pnpm.
