---
'@backstage-community/plugin-announcements': major
---

Refactor legacy announcements frontend to use the new (NFS) components built with `@backstage/ui`.

## Breaking Changes

- `AnnouncementsPage` **no longer supports** the following props:

  - `themeId`
  - `subtitle`
  - `hideContextMenu`
  - `cardOptions`
  - `buttonOptions`
  - `hideInactive`

  If your app passed any of these props, you must remove them (or migrate to new equivalents if/when they are reintroduced by the NFS implementation).

- `AdminPortal` is now implemented via the new announcements admin page and no longer supports customization via props such as `themeId`, `title`, `subtitle`, or `defaultInactive`.
