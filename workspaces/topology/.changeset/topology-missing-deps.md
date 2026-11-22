---
'@backstage-community/plugin-topology': patch
---

Added the missing `mobx` dependency that `mobx-react` requires as a peer, and removed the unused `@backstage/theme` dependency, which required `@material-ui/core` as a peer. This fixes missing peer dependencies with package managers that don't hoist dependencies, such as pnpm.
