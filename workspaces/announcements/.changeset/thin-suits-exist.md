---
'@backstage-community/plugin-announcements': major
---

BREAKING CHANGES: The legacy (existing) frontend system has been updated to leverage all components rebuilt for the new frontend system + `@backstage.ui`.

### AnnouncementsPage

- Drops support for `themeId`, `subtitle`, `hideContextMenu`, `cardOptions`, `buttonOptions`, or `hideInactive`. Mostly due to the underlying components in `@backstage/ui` not supporting these props
- `hideInactive` has been removed as it is no longer needed. Inactive announcements are now hidden by default.

### AnnouncementsAdminPortal

Previously marked deprecated, this component has been removed.

### AnnouncementsTimeline

Previously marked deprecated, this component has been removed.
