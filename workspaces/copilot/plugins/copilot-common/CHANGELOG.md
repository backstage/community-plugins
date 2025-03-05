# @backstage-community/plugin-copilot-common

## 0.6.0

### Minor Changes

- 10cacf8: Backend updated for using the new /metrics API that Github Provides.
  Added new tables to the database to store all metrics provided by Github.

  New metrics output from the backend are currently made compatible with the
  old format expected by the frontend in order to make minimum amount of changes
  in this version.

  The Backend router merges the old saved metrics with the new if the selected
  date range overlaps both old and new metrics. Otherwise it selects from eiter
  old or new.

  It also fetches the maximum availible date range taking into account that
  old metrics and/or new metrics are availible from the database.

## 0.5.0

### Minor Changes

- f5be5aa: Backstage version bump to v1.35.1

## 0.4.0

### Minor Changes

- 53e7191: Backstage version bump to v1.34.2

## 0.3.0

### Minor Changes

- 7f17c9f: Introduced support for organizations and team metrics visualization in the Copilot plugin.

## 0.2.2

### Patch Changes

- 399dc3b: Backstage version bump to v1.32.2

## 0.2.1

### Patch Changes

- 0617e87: Backstage version bump to v1.31.1

## 0.2.0

### Minor Changes

- c55888b: Remove "private" field from package.json to allow potential publishing

## 0.1.1

### Patch Changes

- ad6f23d: Backstage version bump to v1.30.2

## 0.1.0

### Minor Changes

- 2d5f011: Introduced the GitHub Copilot plugin, checkout the plugin's [`README.md`](https://github.com/backstage/community-plugins/tree/main/workspaces/copilot/plugins/copilot) for more details!
