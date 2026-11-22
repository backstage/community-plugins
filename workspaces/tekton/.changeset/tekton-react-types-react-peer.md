---
'@backstage-community/plugin-tekton-react': patch
---

Declared `@types/react` as an optional peer dependency because the published types use React types. This fixes type errors with package managers that don't hoist dependencies, such as pnpm.
