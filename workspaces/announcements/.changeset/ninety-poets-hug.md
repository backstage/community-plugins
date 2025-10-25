---
'@backstage-community/plugin-announcements': patch
---

Fixed routing issue where some links were incorrectly redirecting to `/announcements/admin` instead of `/announcements`. Changed `<AnnouncementsAdminPortal />` from a routable extension to a component extension to resolve the mount point conflict with the main `<AnnouncementsPage />`.
