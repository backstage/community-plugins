# Manage page module: Tech Insights

This Manage page module integrates Backstage Tech Insights into the Manage page.

It provides:

- Aggregated check results rendered as a card or content widget above or below the entity table
- Tech Insights checks rendered as columns in the entity table, either as individual columns per check or as a single aggregated column per entity

## Installation

For the new frontend system, this module can be installed directly:

```sh
`yarn --cwd packages/app add @backstage-community/plugin-manage-module-tech-insights`
```

This installs the module and registers default entity table columns and content widgets for the Manage page.

## Configuration

### Static configuration

Most configuration is done through extension configuration in `app-config.yaml`.

This module exposes three extension node IDs:
| Node ID | Extension |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `manage-card-widget:tech-insights/grid` | Card widget with grid gauges, showing small [tags](https://ui.backstage.io/components/tag-group) with aggregated checks |
| `manage-content-widget:tech-insights/cards` | Content widget with card gauges, showing aggregated checks<br>These are shown by default, but can be turned off with `attachTo: []` |
| `manage-content-widget:tech-insights/grid` | Content widget with grid gauges, showing small [tags](https://ui.backstage.io/components/tag-group) with aggregated checks |
| `manage-column:tech-insights/checks` | Entity table columns |

The example below configures:

- Cards for the Components tab and for the Entities tab (i.e. if all kinds of entities are combined into one tab)
- Grids for Systems
- Card widget with grid gauges for starred entities
- One single column with aggregated checks for the combined Entities tab and for Components, and \
  Multiple columns (one per check) for Systems and Apis

```yaml
app:
  extensions:
    - manage-content-widget:tech-insights/cards:
        config:
          attachTo:
            - component
            - $entities
    - manage-content-widget:tech-insights/grid:
        config:
          attachTo:
            - system
    - manage-card-widget:tech-insights/grid:
        config:
          attachTo:
            - $starred
    - manage-column:tech-insights/checks:
        config:
          attachTo:
            - tab: '$entities'
              multi: false
            - tab: 'component'
              multi: false
            - system
            - api
```

### Dynamic configuration

Additional configuration can be provided programmatically using the `ManageTechInsightsBlueprint` blueprint.

Example:

```ts
const techInsightsConfig = ManageTechInsightsBlueprint.make({
  params: defineParams =>
    defineParams({
      // Remove the trailing " check" from check titles
      mapTitle: check => ({
        title: check.name.toLocaleLowerCase('en-US').endsWith(' check')
          ? check.name.replace(/ check$/i, '')
          : check.name,
        tooltip: check.description,
      }),

      // Show checks that are empty for all entities in the current view
      // Defaults to false
      showEmpty: true,

      // For the Systems tab, hide the "description" check column
      columnsCheckFilter: {
        system: check => {
          return check.id !== 'descriptionCheck';
        },
      },
    }),
});
```

In addition to the options shown above, the following configuration options are also supported:

- `checkFilter` to filter checks globally regardless of tab
- `getPercentColor` to customize the color used for a certain percentage value.

## Installation (Old frontend system)

For installation using the old frontend system, see [README-OFS.md](./README-OFS.md).

The old frontend system is deprecated, and support for it will be removed from this plugin in a future release.
