---
'@backstage-community/plugin-todo': major
---

**BREAKING** Migrated the Todo plugin UI from Material UI / `@backstage/core-components` Table to Backstage UI (`@backstage/ui`). The TODO table, filters, links, and text display now use BUI components. Adopters need `@backstage/ui` styles available in the app (included by default since Backstage `1.41.0`).
