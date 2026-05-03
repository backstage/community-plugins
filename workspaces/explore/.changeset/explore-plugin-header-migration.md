---
'@backstage-community/plugin-explore': minor
---

Migrated the explore page routes (`/explore`, `/domains`, `/groups`,
`/tools`) of `@backstage-community/plugin-explore` from Material UI
(`@material-ui/core`, `@material-ui/icons`) to Backstage UI (`@backstage/ui`).

Changes:

- `ExploreLayout` now renders the page header with `@backstage/ui`'s
  `PluginHeader` (and native tabs) instead of `Header` + `RoutedTabs` from
  `@backstage/core-components`.
- `DomainCard` and `ToolCard` now use BUI `Card`, `CardHeader`, `CardBody`,
  `CardFooter`, `Text` and `ButtonLink`, with styling moved to CSS Modules
  using BUI design tokens.
- `DomainExplorerContent` uses BUI `ButtonLink` in the empty-state action.
- `GroupsExplorerContent` and `GroupsDiagram` use CSS Modules backed by BUI
  CSS variables instead of `makeStyles` and `useTheme`, and the legend uses
  the Remix `RiFullscreenLine` icon and BUI `Text`.

Notes:

- The `subtitle` prop on `ExploreLayout` is deprecated and silently ignored
  because `PluginHeader` does not support a subtitle. The prop is kept for
  backwards compatibility.
- The `tabProps` field on `SubRoute` is deprecated; it was previously typed
  with MUI's `TabProps` and is no longer forwarded to the new BUI tabs.
- The `LayersIcon` used by `NavItemBlueprint` in `alpha.tsx` remains a
  Material UI icon because `NavItemBlueprint` requires the MUI
  `IconComponent` type.

Consumers using the new frontend system (`/alpha`) should ensure the explore
page is registered with `noHeader: true` so the wrapping `PageLayout` does
not render a duplicate header.
