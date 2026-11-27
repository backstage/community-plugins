---
'@backstage-community/plugin-dynatrace': minor
---

**BREAKING** Migrated from Material UI (MUI) to Backstage UI (BUI). This means that Backstage UI is now a requirement for this plugin, see the Backstage UI [installation documentation](https://ui.backstage.io/get-started/installation) for more details. Consuming apps must also import `@backstage/ui/css/styles.css` in their app entry point if it is not already included.
