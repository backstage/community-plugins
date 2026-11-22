---
'@backstage-community/plugin-tech-insights': patch
---

Added the missing `@material-table/core` dependency that `@material-table/exporters` requires as a peer, and its required `@date-io/core` peer. This fixes missing peer dependencies with package managers that don't hoist dependencies, such as pnpm.
