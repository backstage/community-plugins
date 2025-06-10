# @backstage-community/plugin-announcements-backend

## 0.4.0

### Minor Changes

- 9c94358: Added support for submitting announcements on behalf of a team the user is a member of.
  This field is optional. if not specified, the announcement will be submitted using the current publisher user.

### Patch Changes

- Updated dependencies [9c94358]
  - @backstage-community/plugin-announcements-common@0.4.0
  - @backstage-community/plugin-search-backend-module-announcements@0.3.4

## 0.3.3

### Patch Changes

- 11be6bb: chore(deps): Upgrade to Backstage 1.38
- Updated dependencies [11be6bb]
  - @backstage-community/plugin-search-backend-module-announcements@0.3.3
  - @backstage-community/plugin-announcements-common@0.3.2

## 0.3.2

### Patch Changes

- 1f34951: Upgraded to Backstage release 1.37.
- Updated dependencies [1f34951]
  - @backstage-community/plugin-search-backend-module-announcements@0.3.2
  - @backstage-community/plugin-announcements-common@0.3.1

## 0.3.1

### Patch Changes

- 208e250: Updated dependency `@types/uuid` to `^10.0.0`.

## 0.3.0

### Minor Changes

- 22d99d3: - Added a `start at` field to allow users to set the date when an announcement occurred.
  - Announcements can now be sorted by `createdAt` (default) or `startAt` date, with customizable order (`desc` or `asc`).
  - Updated the New Announcement form to accommodate `start at` and future fields.
  - Added `Created at` and `Start at` columns to the admin view table.

### Patch Changes

- 3e46343: Fix linting issues
- Updated dependencies [22d99d3]
  - @backstage-community/plugin-announcements-common@0.3.0
  - @backstage-community/plugin-search-backend-module-announcements@0.3.1

## 0.2.1

### Patch Changes

- Updated dependencies [f253ff9]
  - @backstage-community/plugin-search-backend-module-announcements@0.3.0

## 0.2.0

### Minor Changes

- e06ffa0: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [e06ffa0]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-search-backend-module-announcements@0.2.0

## 0.1.4

### Patch Changes

- 59eab31: Removed reference to `@backstage/backend-common`

## 0.1.3

### Patch Changes

- 22fd3a1: An internal refactor to create the announcements context with persistence via the `buildAnnouncementsContext` function.
- e282a2d: Minor improvements to README documentation
- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3
  - @backstage-community/plugin-search-backend-module-announcements@0.1.3

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2
  - @backstage-community/plugin-search-backend-module-announcements@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-search-backend-module-announcements@0.1.1
  - @backstage-community/plugin-announcements-common@0.1.1
