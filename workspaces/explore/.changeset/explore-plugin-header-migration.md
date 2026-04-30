---
'@backstage-community/plugin-explore': minor
---

Migrated `ExploreLayout` to the new Backstage UI `PluginHeader`. The plugin
header is now rendered using `@backstage/ui`'s `PluginHeader` component with
native tabs, replacing the previous `Header` + `RoutedTabs` combination from
`@backstage/core-components`.

The `subtitle` prop on `ExploreLayout` is now deprecated and no longer
displayed, as `PluginHeader` does not support a subtitle. The prop is kept
for backwards compatibility but is silently ignored.

Consumers using the new frontend system (`/alpha`) should ensure the explore
page is registered with `noHeader: true` so the wrapping `PageLayout` does
not render a duplicate header.
