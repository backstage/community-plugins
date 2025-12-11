---
'@backstage-community/plugin-announcements': patch
---

- New dedicated routes to the admin portal (`/announcements/admin`, `/announcements/admin/categories`, `/announcements/admin/tags`)
- The exported `AnnouncementsTimeline` and `AnnouncementsAdminPortal` components have been deprecated as they will not be migrated to the new frontend system. Please see each component's deprecation notice for more details.

### New frontend system + @backstage/ui updates

We are rebuilding several major components of the announcements plugin from scratch leveraging the `@backstage/ui` library. To start, the admin portal now leverages the new header component from the `@backstage/ui` library. Users who have migrated to the new frontend system will gradually receive these until the plugin is fully migrated. Users on the existing frontend system will not see any changes.
