# @backstage-community/plugin-search-backend-module-announcements

## 0.2.5

### Patch Changes

- 2bee323: Added config.d.ts for configuring the task scheduler

## 0.2.4

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1
- Updated dependencies [5d34ab8]
  - @backstage-community/plugin-announcements-common@0.2.4
  - @backstage-community/plugin-announcements-node@0.2.4

## 0.2.3

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json
- Updated dependencies [9937f08]
  - @backstage-community/plugin-announcements-common@0.2.3
  - @backstage-community/plugin-announcements-node@0.2.3

## 0.2.2

### Patch Changes

- 656ef61: Update to Backstage version 1.27.1
- Updated dependencies [656ef61]
  - @backstage-community/plugin-announcements-common@0.2.2
  - @backstage-community/plugin-announcements-node@0.2.2

## 0.2.1

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)
- Updated dependencies [3a7ae1a]
  - @backstage-community/plugin-announcements-common@0.2.1
  - @backstage-community/plugin-announcements-node@0.2.1

## 0.2.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-announcements-node@0.2.0

## 0.1.1

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- e5c0685: Refactor the AnnouncementsCollatorFactory to use the service coming from the new `announcements-node` package. This removes the modules dependency on `announcements-backend` which we ultimately don't want.
- ee57cf2: Export collators from search backend module and deprecate the collators coming from `announcements-backend`. Users are recommended to update their imports to use `@backstage-community/plugin-search-backend-module-announcements`.
- Updated dependencies [2b03aeb]
  - @backstage-community/plugin-announcements-common@0.1.4
  - @backstage-community/plugin-announcements-node@0.1.1
