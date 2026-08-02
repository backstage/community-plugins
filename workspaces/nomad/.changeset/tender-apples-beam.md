---
'@backstage-community/plugin-nomad': patch
---

Migrated the nomad plugin from Material-UI (MUI) to Backstage UI (BUI). Replaced `@material-ui/core` components (`Box`, `Card`, `Table`, `Typography`) with their BUI equivalents and replaced `makeStyles` with CSS Modules using BUI CSS custom properties. Closes #7869
