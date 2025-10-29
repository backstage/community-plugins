# @backstage-community/plugin-mend

## 0.10.0

### Minor Changes

- f48c4f9: Backstage version bump to v1.44.0

## 0.9.0

### Minor Changes

- 063ba67: Backstage version bump to v1.43.2

## 0.8.0

### Minor Changes

- c97a8de: Migrated plugin to Material UI 5 and Added More Pagination Option for the Table

## 0.7.0

### Minor Changes

- d85e394: Removed the `baseUrl` field from the Backstage configuration; now derived using the `activationKey`.
  Enhanced drill-down functionality to filter projects on the Findings Overview page using the `sourceUrl`.
  Added support for displaying projects with `sourceUrl` from GitLab, Bitbucket, and Azure Repos.
  Updated branding text from `mend.io` to `Mend.io`.
  Improved and repositioned the Project Name multi-select filter on the Findings Overview page.
  Added tooltip for the Project Name multi-select filter.

## 0.6.0

### Minor Changes

- a2803e9: Backstage version bump to v1.42.3

## 0.5.0

### Minor Changes

- caba2d1: Fixed Issue #4856 – Updated the logic to map projects and Backstage entities based on the repository URL instead of the project name.
  Resolved an issue where multiple projects sharing the same `sourceUrl` were not all being displayed.
  Enhanced the Finding Overview tab by adding a multi-select filter and a new column to display the Project Name in the Findings table.

## 0.4.0

### Minor Changes

- 4ccd86f: Backstage version bump to v1.40.2

## 0.3.0

### Minor Changes

- 6d13cab: Backstage version bump to v1.37.0

## 0.2.1

### Patch Changes

- 6347c27: Fix linter issues

## 0.2.0

### Minor Changes

- 0d01419: Backstage version bump to v1.35.1

## 0.1.2

### Patch Changes

- 31e9be5: Updates to fix the API Reports

## 0.1.1

### Patch Changes

- 9f04c05: Updated dependency `@material-table/core` to `4.3.46`.

## 0.1.0

### Minor Changes

- 898b5f1: Initial release of the `@backstage-community/plugin-mend` plugin.
