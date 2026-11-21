---
'@backstage-community/plugin-cicd-statistics': patch
---

Added missing dependency on `@backstage/filter-predicates` and an optional peer dependency on `@types/react`, which the published types use, and added `prop-types`, which `@material-ui/pickers` requires as a peer dependency. This fixes type and peer dependency errors with package managers that don't hoist dependencies, such as pnpm.
