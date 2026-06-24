---
'@backstage-community/plugin-quay': minor
---

Migrated the Quay plugin and dev app from Material UI to Backstage UI (BUI). Replaced `@material-ui/*` with `@backstage/ui` components and `@remixicon/react` icons. Removed direct MUI dependencies; no breaking API changes to plugin exports.

**Note for consuming apps:** import `@backstage/ui/css/styles.css` in your app entry point if it is not already included.
