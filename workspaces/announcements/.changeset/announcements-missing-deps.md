---
'@backstage-community/plugin-announcements': patch
---

Added missing dependency on `@backstage/filter-predicates`, which the published alpha types use. This fixes type errors with package managers that don't hoist dependencies, such as pnpm.
