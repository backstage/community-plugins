---
'@backstage-community/plugin-npm': patch
---

Improve error handling when the npm plugin is used without the existing `isNpmAvailable` condition for catalog entities and without the `npm/package` annotation. A generic error was shown instead of the expected missing annotation component (`MissingAnnotationEmptyState`).
