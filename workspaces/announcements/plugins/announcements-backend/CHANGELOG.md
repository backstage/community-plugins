# @backstage-community/plugin-announcements-backend

## 0.15.1

### Patch Changes

- 95470f7: Add auditing of announcement creation, updates, and deletions via [Auditor Service](https://backstage.io/docs/backend-system/core-services/auditor/).
- Updated dependencies [95470f7]
  - @backstage-community/plugin-announcements-common@0.12.1

## 0.15.0

### Minor Changes

- cd040b2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [cd040b2]
  - @backstage-community/plugin-announcements-common@0.12.0

## 0.14.0

### Minor Changes

- d34e875: Added updated_at field, extended sorting capabilities NewAnnouncementsBanner

### Patch Changes

- Updated dependencies [d34e875]
  - @backstage-community/plugin-announcements-common@0.11.0

## 0.13.0

### Minor Changes

- 5827ca1: Fire signal or notification only on active announcement

## 0.12.0

### Minor Changes

- 58ccd64: Fixed handling of `active` prop in NewAnnouncementBanner
  Extended signal and notification on update when the annoucencement is activated
  Updated `EditAnnoucementPage` to navigate to root path as the announcement creation page
  Updated `EditAnnoucementPage` alertApi on success to be transient
- 2d1724c: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [2d1724c]
  - @backstage-community/plugin-announcements-common@0.10.0

## 0.11.1

### Patch Changes

- 2007a96: Fixed #5322 that caused `500` errors when fetching existing announcements with null `until_date`.
- Updated dependencies [2007a96]
  - @backstage-community/plugin-announcements-common@0.9.1

## 0.11.0

### Minor Changes

- 4a3e603: Added support for an `until_date` field in announcements and introduced a new `current` filter.
- 4a89fd8: With these changes, notifications can be enabled whenever new announcement is created. Announcement notifications are disabled by-default. For details, about notification, please refer [`Notifications`](https://backstage.io/docs/notifications/) docs.

  announcements: integration with notifications #4378

### Patch Changes

- Updated dependencies [4a3e603]
- Updated dependencies [4a89fd8]
  - @backstage-community/plugin-announcements-common@0.9.0

## 0.10.0

### Minor Changes

- e121abb: Backstage version bump to v1.42.3

### Patch Changes

- Updated dependencies [e121abb]
  - @backstage-community/plugin-announcements-common@0.8.0

## 0.9.0

### Minor Changes

- bb76f4e: This change introduces tag filtering to announcements, allowing users to filter by tag by clicking on a tag on an announcement card.
- 220cc20: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [220cc20]
  - @backstage-community/plugin-announcements-common@0.7.0

## 0.8.0

### Minor Changes

- 1a231d9: Potentially BREAKING CHANGES for those who were still using the deprecated code.

  - Removes code related to deprecated search collator from `@backstage-community/plugin-announcements-backend` (import from `@backstage-community/plugin-search-backend-module-announcements`)
  - Removes code related to deprecated `announcementsService` from `@backstage-community/plugin-announcements-node` in favor of `announcementsServiceRef`

### Patch Changes

- cbc8c92: Deprecates createPermissionIntegrationRouter in favor of leveraging the new PermissionsRegistryService. There should be no external impact to end users.

## 0.7.0

### Minor Changes

- 775d236: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [775d236]
  - @backstage-community/plugin-announcements-common@0.6.0
  - @backstage-community/plugin-search-backend-module-announcements@0.5.0

## 0.6.0

### Minor Changes

- 8c803d8: Added support for tags in announcements

### Patch Changes

- Updated dependencies [8c803d8]
  - @backstage-community/plugin-announcements-common@0.5.1
  - @backstage-community/plugin-search-backend-module-announcements@0.4.1

## 0.5.0

### Minor Changes

- 7e38fa0: Backstage version bump to v1.39.1

### Patch Changes

- Updated dependencies [7e38fa0]
  - @backstage-community/plugin-search-backend-module-announcements@0.4.0
  - @backstage-community/plugin-announcements-common@0.5.0

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
