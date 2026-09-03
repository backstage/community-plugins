---
'@backstage-community/plugin-announcements-backend': patch
---

Moved `@backstage/backend-test-utils` from `dependencies` to `devDependencies`, as it is only used in tests and the local dev harness. This stops it, and its `better-sqlite3` dependency, from being installed into consumers' production dependency trees.
