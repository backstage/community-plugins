---
'@backstage-community/plugin-entity-feedback-backend': patch
---

Fixed bug where 404 errors were thrown in case entityRef in URI was decoded by middleware before reaching backend
