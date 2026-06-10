---
'@backstage-community/plugin-nexus-repository-manager': patch
---

Migrated the Nexus Repository Manager plugin UI from Material UI to Backstage UI (`@backstage/ui`). Removed direct MUI dependencies; no breaking API changes.

Added `@backstage/frontend-test-utils` as a dev dependency so the alpha dev app (`yarn start:alpha`) can resolve `@backstage/plugin-catalog-react/testUtils`.
