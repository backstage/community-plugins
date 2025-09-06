---
'@backstage-community/plugin-announcements': minor
'@backstage-community/plugin-announcements-backend': minor
'@backstage-community/plugin-announcements-common': minor
'@backstage-community/plugin-announcements-react': minor
---

Added support for an `until_date` field in announcements and introduced a new `current` filter.

- **Database & Backend**

  - Added `until_date` column with migration.
  - Introduced `current` filter: returns announcements where the current date falls between `start_at` and `until_date`. Handles null values.

- **Frontend**

  - Added `current` filter prop to announcement components.
  - Updated **Admin portal** with a new **Until** column.
  - Updated **Create Announcement form** with an **Until Date** field.
  - Improved filtering options (no filter, current only, current + active).

- **Common**

  - Updated `types.ts` to include the new `until_date` field.

- **React**
  - Updated `report.md` and translation files for UI label text.
  - Updated API and client to support `until_date` and `current` filter.

This update is backwards compatible — announcements without an `until_date` should continue to work as before. With announcements with no 'until_date' field, using the 'current' filter will display them (treated as no end and therefore current). But can be updated with a new until date!
