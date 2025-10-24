# @backstage-community/plugin-search-backend-module-announcements

## 0.9.1

### Patch Changes

- Updated dependencies [95470f7]
  - @backstage-community/plugin-announcements-common@0.12.1
  - @backstage-community/plugin-announcements-node@0.10.1

## 0.9.0

### Minor Changes

- cd040b2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [cd040b2]
  - @backstage-community/plugin-announcements-common@0.12.0
  - @backstage-community/plugin-announcements-node@0.10.0

## 0.8.1

### Patch Changes

- Updated dependencies [d34e875]
  - @backstage-community/plugin-announcements-common@0.11.0
  - @backstage-community/plugin-announcements-node@0.9.1

## 0.8.0

### Minor Changes

- 2d1724c: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [2d1724c]
  - @backstage-community/plugin-announcements-common@0.10.0
  - @backstage-community/plugin-announcements-node@0.9.0

## 0.7.2

### Patch Changes

- Updated dependencies [2007a96]
  - @backstage-community/plugin-announcements-common@0.9.1
  - @backstage-community/plugin-announcements-node@0.8.2

## 0.7.1

### Patch Changes

- Updated dependencies [4a3e603]
- Updated dependencies [4a89fd8]
  - @backstage-community/plugin-announcements-common@0.9.0
  - @backstage-community/plugin-announcements-node@0.8.1

## 0.7.0

### Minor Changes

- e121abb: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [e121abb]
  - @backstage-community/plugin-announcements-common@0.8.0
  - @backstage-community/plugin-announcements-node@0.8.0

## 0.6.0

### Minor Changes

- 220cc20: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [220cc20]
  - @backstage-community/plugin-announcements-common@0.7.0
  - @backstage-community/plugin-announcements-node@0.7.0

## 0.5.1

### Patch Changes

- Updated dependencies [1a231d9]
  - @backstage-community/plugin-announcements-node@0.6.0

## 0.5.0

### Minor Changes

- 775d236: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [775d236]
  - @backstage-community/plugin-announcements-common@0.6.0
  - @backstage-community/plugin-announcements-node@0.5.0

## 0.4.1

### Patch Changes

- Updated dependencies [8c803d8]
  - @backstage-community/plugin-announcements-common@0.5.1
  - @backstage-community/plugin-announcements-node@0.4.1

## 0.4.0

### Minor Changes

- 7e38fa0: Backstage version bump to v1.39.1

### Patch Changes

- Updated dependencies [7e38fa0]
  - @backstage-community/plugin-announcements-common@0.5.0
  - @backstage-community/plugin-announcements-node@0.4.0

## 0.3.4

### Patch Changes

- Updated dependencies [9c94358]
  - @backstage-community/plugin-announcements-common@0.4.0
  - @backstage-community/plugin-announcements-node@0.3.4

## 0.3.3

### Patch Changes

- 11be6bb: chore(deps): Upgrade to Backstage 1.38
- Updated dependencies [11be6bb]
  - @backstage-community/plugin-announcements-common@0.3.2
  - @backstage-community/plugin-announcements-node@0.3.3

## 0.3.2

### Patch Changes

- 1f34951: Upgraded to Backstage release 1.37.
- Updated dependencies [1f34951]
  - @backstage-community/plugin-announcements-common@0.3.1
  - @backstage-community/plugin-announcements-node@0.3.2

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
