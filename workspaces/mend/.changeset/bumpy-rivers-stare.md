---
'@backstage-community/plugin-mend-backend': major
---

Improved performance using Cache Service and removed unused Proxy API. The backend now requires the `mend.io/project-ids` annotation on entities.

**BREAKING CHANGE**: The Mend project mapping has changed from runtime resolution based on `backstage.io/source-location` to annotation-based lookup using `mend.io/project-ids`.

**Migration Required**: Install `@backstage-community/plugin-catalog-backend-module-mend-entity-processor` to automatically populate the `mend.io/project-ids` annotation on your entities based on their `backstage.io/source-location`.
