# @backstage-community/plugin-manage-react

## 2.1.0

### Minor Changes

- 0b7e3de: Updated UI - moved most of the UI from MUI to BUI.

  Also introduced a new 'linear' progress style, and implemented new circular progress styles.

  Support for the old frontend system is marked as deprecated for all manage plugins

- 334c2e0: Backstage version bump to v1.47.1

### Patch Changes

- Updated dependencies [334c2e0]
  - @backstage-community/plugin-manage-common@1.5.0

## 2.0.0

### Major Changes

- 073b5ec: This package now exposes blueprints for the new frontend system!

  BREAKING CHANGE:
  The DefaultApi now requires a `configApi` parameter. Note that when using the new frontend system, there is no need to manually register the API.

### Patch Changes

- Updated dependencies [073b5ec]
  - @backstage-community/plugin-manage-common@1.4.1

## 1.4.0

### Minor Changes

- 483cbdb: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [483cbdb]
  - @backstage-community/plugin-manage-common@1.4.0

## 1.3.0

### Minor Changes

- 797c5cc: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [797c5cc]
  - @backstage-community/plugin-manage-common@1.3.0

## 1.2.0

### Minor Changes

- e40ad8c: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [e40ad8c]
  - @backstage-community/plugin-manage-common@1.2.0

## 1.1.1

### Patch Changes

- 7593e17: Fixed erroneous repository.url in package.json

## 1.1.0

### Minor Changes

- ba844d0: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [ba844d0]
  - @backstage-community/plugin-manage-common@1.1.0

## 1.0.0

### Major Changes

- 6e2fffe: Moved logic to fetch ownership and entities to the new @backstage-community/plugin-manage-backend

  BREAKING CHANGE: This package now requires the backend to be installed.

### Patch Changes

- Updated dependencies [6e2fffe]
  - @backstage-community/plugin-manage-common@1.0.1

## 0.1.2

### Patch Changes

- d8b448d: Bump backastage dependencies to 1.37.0

## 0.1.1

### Patch Changes

- 7d08df0: Export usePosition hook, to deduce the available screen size for an element
