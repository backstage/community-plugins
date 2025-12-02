---
'@backstage-community/plugin-announcements': patch
---

Adds additional routes to support URL-based navigation for admin portal tabs

- New route refs for nested admin routes: `adminAnnouncementsRouteRef`, `adminCategoriesRouteRef`, `adminTagsRouteRef`
- `AdminPortalProps` type is now exported as a public API
- Admin portal tabs now use URL-based navigation instead of local state

### Deprecation Notice

- `announcementAdminRouteRef` is now deprecated. Use `adminRouteRef` instead. The deprecated route ref will continue to work but will be removed in a future release.
