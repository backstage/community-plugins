---
'@backstage-community/plugin-announcements-backend': minor
'@backstage-community/plugin-announcements-common': minor
'@backstage-community/plugin-announcements-react': minor
'@backstage-community/plugin-announcements': minor
---

- Added a `start_at` field to allow users to set the date when an announcement occurred.
- Announcements can now be sorted by `createdAt` (default) or `startAt`, with customizable order (desc or asc).
- Updated the New Announcement form to accommodate start_at and future fields.
- Added `created_at` and `start_at` columns to the admin view table.
