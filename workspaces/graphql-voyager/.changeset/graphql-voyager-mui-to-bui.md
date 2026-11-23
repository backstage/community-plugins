---
'@backstage-community/plugin-graphql-voyager': minor
---

**BREAKING** Migrated from Material UI (MUI) to Backstage UI (BUI). Endpoint tabs and status text now use `@backstage/ui` components. Consuming apps must import `@backstage/ui/css/styles.css` if they do not already — see the Backstage UI [installation documentation](https://ui.backstage.io/get-started/installation).

Also keeps previously visited endpoint panels mounted to avoid a loading flash when switching tabs, and keeps Voyager's light query/options chrome readable under Backstage dark mode.
