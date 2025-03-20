# @backstage-community/plugin-search-backend-module-announcements

## 0.3.1

### Patch Changes

- Updated dependencies [22d99d3]
  - @backstage-community/plugin-announcements-common@0.3.0
  - @backstage-community/plugin-announcements-node@0.3.1

## 0.3.0

### Minor Changes

- f253ff9: **breaking** - replace `discoveryApi` param with `discovery` in `DefaultAnnouncementsService.create({})`. This better aligns with Backstage naming conventions.

  ```diff
  const announcementsService = DefaultAnnouncementsService.create({
  -   discoveryApi: discoveryServiceRef,
  +   discovery: discoveryServiceRef,
  });
  ```

  This does not impact most users, but if you are using the `DefaultAnnouncementsService` in a custom service, you will need to update your code.

### Patch Changes

- Updated dependencies [f253ff9]
  - @backstage-community/plugin-announcements-node@0.3.0

## 0.2.0

### Minor Changes

- e06ffa0: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [e06ffa0]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-announcements-node@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3
  - @backstage-community/plugin-announcements-node@0.1.3

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2
  - @backstage-community/plugin-announcements-node@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-announcements-common@0.1.1
  - @backstage-community/plugin-announcements-node@0.1.1
