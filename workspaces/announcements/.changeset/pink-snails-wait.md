---
'@backstage-community/plugin-announcements': minor
---

- Centered text for empty tables in:
  - Announcements
  - Category
  - Tags
- Properly mounted in the frontend the `/tags` path
- Updated `CategoriesPage` and `TagsPage` in order to display the `ContextMenu`
- Added titleLength prop in order to truncate title on `AnnouncementDetails`
- Fixed insert of Categories from `CategoriesPage` and clean up on dialog
- Added in the `NewAnnouncementBanner` a `cardOptions={{titleLength,excerptLength }}` props, this would allow to truncate text. Default is 50.
- Now in the `NewAnnouncementBanner` when the title get clicked, the alert is dismissed as user navigate to alert details
