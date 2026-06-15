---
'@backstage-community/plugin-quay': patch
---

Migrated the Quay plugin and dev app from Material UI v4 to MUI v5. Replaced `@material-ui/*` with `@mui/material`, `@mui/icons-material`, and `@mui/styles`; migrated `makeStyles` in the plugin to `@mui/styles` and in the dev app to `tss-react/mui`. Existing `@backstage/ui` CSS imports are unchanged. No breaking API changes.

---
