---
'@backstage-community/plugin-announcements-backend': patch
'@backstage-community/plugin-announcements-common': patch
'@backstage-community/plugin-announcements': patch
---

Fixed #5322 that caused `500` errors when fetching existing announcements with null `until_date`.
