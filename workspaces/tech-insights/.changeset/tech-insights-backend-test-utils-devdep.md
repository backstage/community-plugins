---
'@backstage-community/plugin-tech-insights-backend': patch
---

Moved `@backstage/backend-test-utils` from `dependencies` to `devDependencies`, as it is only used in tests. This stops it, and its `better-sqlite3` dependency, from being installed into consumers' production dependency trees.
