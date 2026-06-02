---
'@backstage-community/plugin-cloudbuild': patch
---

Migrated the cloudbuild plugin from Material UI (MUI) to Backstage UI (BUI). Replaced `Typography`, `Box`, `Paper`, `IconButton`, `Tooltip`, `LinearProgress`, and Material UI icons with their `@backstage/ui` and `@remixicon/react` equivalents. `makeStyles` was replaced with CSS Modules using BUI design tokens.
