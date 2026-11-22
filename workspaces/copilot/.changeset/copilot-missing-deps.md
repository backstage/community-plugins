---
'@backstage-community/plugin-copilot': patch
---

Added an optional peer dependency on `@types/react`, which the published types use, a peer dependency on `@material-ui/core`, which `@backstage/theme` requires, and a dependency on `@mui/system`, which `@mui/x-charts` requires. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
