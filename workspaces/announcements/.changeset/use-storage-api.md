---
'@backstage-community/plugin-announcements-react': minor
'@backstage-community/plugin-announcements': minor
---

Replaced direct `WebStorage` usage with the Backstage `StorageApi` interface for dismiss state persistence. This allows Backstage instances with a user-settings backend to automatically persist announcement dismiss state server-side, enabling cross-device and cross-browser consistency. The `@backstage/core-app-api` dependency has been removed from `announcements-react` as it is no longer needed.
