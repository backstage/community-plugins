---
'@backstage-community/plugin-tech-radar': major
---

**BREAKING** Migrated the Tech Radar plugin UI from Material UI to Backstage UI (`@backstage/ui`). Search, dialogs, typography, layout, and icons no longer depend on `@material-ui/core`. Adopters need `@backstage/ui` styles available in the app (included by default since Backstage `1.41.0`).
