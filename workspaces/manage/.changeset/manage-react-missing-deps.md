---
'@backstage-community/plugin-manage-react': patch
---

Added missing dependency on `@backstage/config` and an optional peer dependency on `@types/react`, which the published types use. `@dnd-kit/utilities` is now a regular dependency instead of a peer dependency, so apps and plugins that use this package no longer need to install it themselves. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
