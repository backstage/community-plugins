---
'@backstage-community/plugin-adr': minor
---

Migrate the ADR plugin interface to Backstage UI. This drops support for React 16/17 and React Router versions below 6.30.2 because Backstage UI requires React 18 and React Router 6.30.2 or later. Before upgrading, update your app to React 18 and React Router 6.30.2 or later.

**Note for consuming apps:** import `@backstage/ui/css/styles.css` in your app entry point if it is not already included.
