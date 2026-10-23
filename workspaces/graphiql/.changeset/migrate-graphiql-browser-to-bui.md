---
'@backstage-community/plugin-graphiql': minor
---

Migrated `GraphiQLBrowser` and `GraphiQLPage` from Material-UI to Backstage UI (`@backstage/ui`). Tabs, typography, and the endpoint switcher now use BUI's `Tabs`/`TabList`/`Tab`/`TabPanel` and `Text` components. `@material-ui/core` is still a dependency for the `GraphiQLIcon` component, which relies on MUI's `SvgIcon` type as required by existing Backstage icon APIs.

**Note for consuming apps:** import `@backstage/ui/css/styles.css` in your app entry point if it is not already included.

**Breaking change:** The migration requires React and React DOM 18, React 18 type definitions, and React Router DOM 6.30.2 or later within version 6 to match Backstage UI's requirements. React 16/17 and older React Router versions are no longer supported. Upgrade these dependencies in your app before updating this plugin.
