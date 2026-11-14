---
'@backstage-community/plugin-bookmarks': minor
---

Migrated the bookmarks plugin from Material UI (MUI) to Backstage UI (`@backstage/ui`). The bookmarks viewer, navigation buttons, table of contents, mobile drawer and loading indicator no longer depend on `@mui/*` packages, which have been removed from the plugin's dependencies, and icons now come from `@remixicon/react`.

**Note for consuming apps:** import `@backstage/ui/css/styles.css` in your app entry point if it is not already included.

**Behavior change:** the desktop layout now switches at Backstage UI's `md` breakpoint (1024px) instead of MUI's (900px).
