---
'@backstage-community/plugin-announcements': minor
---

- Added support for overriding `title`, `hideStartAt` and `markdownRenderer` via app-config for announcements page.
- `category` and `defaultInactive` props are now deprecated and will be removed in future releases. Use URL state to filter by category (e.g. `?category=...`). Inactive announcements are now hidden by default.
- Update @uiw/react-md-editor dependency to version 4.0.11.
