# @backstage-community/plugin-servicenow

## 1.4.0

### Minor Changes

- 5525f41: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [5525f41]
  - @backstage-community/plugin-servicenow-common@1.4.0

## 1.3.0

### Minor Changes

- 39c3ef0: Backstage version bump to v1.42.5

### Patch Changes

- Updated dependencies [39c3ef0]
  - @backstage-community/plugin-servicenow-common@1.3.0

## 1.2.0

### Minor Changes

- 0d3e031: Added support for the new frontend system.

  The plugin automatically adds a "ServiceNow" tab to a software catalog entity if the entity has an `servicenow.com/entity-id` annotation.

  It does not add the "My ServiceNow Tickets" tab to the user entity for now.

- 6be0265: Export the catalog entity tab content as `EntityServicenowContent` instead of `ServicenowPage` to align it with the Backstage naming conventions.

  The `ServicenowPage` is still exported for now, but marked as **deprecated**. It might be removed or replaced in a future release.

### Patch Changes

- 6be0265: Create and export new catalog entity filter function isServicenowAvailable
- Updated dependencies [6be0265]
- Updated dependencies [6be0265]
  - @backstage-community/plugin-servicenow-common@1.2.0

## 1.1.1

### Patch Changes

- 34aa972: Updated dependency `@mui/icons-material` to `5.18.0`.
  Updated dependency `@mui/material` to `5.18.0`.
  Updated dependency `@mui/styles` to `5.18.0`.
  Updated dependency `@mui/lab` to `5.0.0-alpha.177`.

## 1.1.0

### Minor Changes

- cbfb5c5: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [cbfb5c5]
  - @backstage-community/plugin-servicenow-common@1.1.0

## 1.0.0

### Major Changes

- 3d708ba: First version of ServiceNow plugin

### Patch Changes

- Updated dependencies [3d708ba]
  - @backstage-community/plugin-servicenow-common@1.0.0
