---
'@backstage-community/plugin-graphiql': major
---

**BREAKING** Migrated the GraphiQL plugin UI from Material UI to Backstage UI (`@backstage/ui`). Endpoint tabs, typography, and the GraphiQL icon no longer depend on `@material-ui/core`. `GraphiQLIcon` now accepts standard SVG element props instead of MUI `SvgIconProps`. Adopters need `@backstage/ui` styles available in the app (included by default since Backstage `1.41.0`).
