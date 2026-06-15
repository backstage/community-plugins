---
'@backstage-community/plugin-jfrog-artifactory': patch
---

Migrated the JFrog Artifactory plugin UI from Material UI to Backstage UI (`@backstage/ui`). The repository table now uses BUI `Table`, `SearchField`, and pagination controls. Removed direct MUI dependencies; no breaking API changes.

Also fixed the filter input growing when typing, and added i18n support for pagination labels (page size selector and result range) in all supported locales.

**Note for consuming apps:** import `@backstage/ui/css/styles.css` in your app entry point if it is not already included.
