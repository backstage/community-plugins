---
'@backstage-community/plugin-nexus-repository-manager': patch
---

Migrated the Nexus Repository Manager plugin UI from Material UI to Backstage UI (`@backstage/ui`). Removed direct MUI dependencies; no breaking API changes.

Added `@backstage/frontend-test-utils` as a dev dependency so the alpha dev app (`yarn start:alpha`) can resolve `@backstage/plugin-catalog-react/testUtils`. Bumped `react-router-dom` dev dependency to `^6.30.2` to satisfy the peer requirement from `@backstage/frontend-test-utils`.

Fixed the alpha dev app so `maven-example` loads correctly: the entity-content filter now uses `isNexusRepositoryManagerExperimentalAvailable` (so Maven annotations show the Build Artifacts tab), and the dev mocks include experimental annotations plus Maven fixture data.
