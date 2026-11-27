---
'@backstage-community/plugin-quay': patch
---

Declared `@types/react` as an optional peer dependency because the published types use React types, and added the missing `@backstage/plugin-permission-common` dependency that `@backstage-community/plugin-quay-common` requires as a peer. Removed the unused `@backstage/theme` dependency, which required `@material-ui/core` as a peer. This fixes type errors and missing peer dependencies with package managers that don't hoist dependencies, such as pnpm.
