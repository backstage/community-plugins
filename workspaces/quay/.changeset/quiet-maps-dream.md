---
'@backstage-community/plugin-quay': patch
---

Migrated the Quay plugin and dev app from Material UI v4 to MUI v5. Replaced `@material-ui/*` with `@mui/material` and `@mui/icons-material`; migrated plugin styling to the `sx` prop and dev app `makeStyles` to `tss-react/mui`. Existing `@backstage/ui` CSS imports are unchanged. No breaking API changes.
