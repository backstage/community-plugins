---
'@backstage-community/plugin-announcements-backend': minor
'@backstage-community/plugin-announcements-node': minor
---

Potentially BREAKING CHANGES for those who were still using the deprecated code.

- Removes code related to deprecated search collator from `@backstage-community/plugin-announcements-backend` (import from `@backstage-community/plugin-search-backend-module-announcements`)
- Removes code related to deprecated `announcementsService` from `@backstage-community/plugin-announcements-node` in favor of `announcementsServiceRef`
