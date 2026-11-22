---
'@backstage-community/plugin-copilot': patch
---

Added an optional peer dependency on `@types/react`, which the published types use, and a dependency on `@mui/system`, which `@mui/x-charts` requires. Moved `@backstage/theme` to dev dependencies, because only the local development app uses it. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
