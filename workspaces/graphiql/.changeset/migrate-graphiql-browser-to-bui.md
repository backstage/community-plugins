---
'@backstage-community/plugin-graphiql': minor
---

Migrated `GraphiQLBrowser` and `GraphiQLPage` from Material-UI to Backstage UI (`@backstage/ui`). Tabs, typography, and the endpoint switcher now use BUI's `Tabs`/`TabList`/`Tab`/`TabPanel` and `Text` components. `@material-ui/core` is still a dependency for the `GraphiQLIcon` component, which relies on MUI's `SvgIcon` type as required by existing Backstage icon APIs.
