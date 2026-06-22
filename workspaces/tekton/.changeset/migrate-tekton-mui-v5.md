---
'@backstage-community/plugin-tekton': patch
---

Migrated the Tekton plugin UI from Material UI v4 (`@material-ui/*`) to MUI v5 (`@mui/*`). Replaced `makeStyles`/`withStyles` usage with `sx` prop styling and added `TektonStylesProvider` with a class name seed to avoid CSS collisions with the host app. No breaking API changes.
