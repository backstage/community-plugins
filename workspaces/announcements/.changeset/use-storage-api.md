---
'@backstage-community/plugin-announcements-react': minor
'@backstage-community/plugin-announcements': minor
---

Announcement dismiss state is now stored through the Backstage storage API instead of browser storage directly. On Backstage instances with a user-settings backend, dismiss state is persisted per user and stays consistent across browsers and devices.

**BREAKING**: The built-in announcements client now requires a storage API to be provided and no longer accepts an unused `errorApi`. Consumers that construct the client directly must supply `storageApi`; consumers using the standard plugin wiring require no changes.
