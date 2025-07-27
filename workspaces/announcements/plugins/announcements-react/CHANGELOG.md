# @backstage-community/plugin-announcements-react

## 0.9.0

### Minor Changes

- bb76f4e: This change introduces tag filtering to announcements, allowing users to filter by tag by clicking on a tag on an announcement card.
- 220cc20: Backstage version bump to v1.41.1

### Patch Changes

- Updated dependencies [220cc20]
  - @backstage-community/plugin-announcements-common@0.7.0

## 0.8.0

### Minor Changes

- 775d236: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [775d236]
  - @backstage-community/plugin-announcements-common@0.6.0

## 0.7.0

### Minor Changes

- 8c803d8: Added support for tags in announcements

### Patch Changes

- Updated dependencies [8c803d8]
  - @backstage-community/plugin-announcements-common@0.5.1

## 0.6.1

### Patch Changes

- b5402a7: Fix pagination issue when fetching groups. This resolves the issue where the "On-Behalf" team dropdown always displayed only 10 groups.

## 0.6.0

### Minor Changes

- 7e38fa0: Backstage version bump to v1.39.1

### Patch Changes

- dc57fe9: Optimize query by filtering only entries with `kind: group`. Add `displayName` to the "On behalf of" dropdown for easier group identification and selection.
- Updated dependencies [7e38fa0]
  - @backstage-community/plugin-announcements-common@0.5.0

## 0.5.0

### Minor Changes

- 9c94358: Added support for submitting announcements on behalf of a team the user is a member of.
  This field is optional. if not specified, the announcement will be submitted using the current publisher user.

### Patch Changes

- Updated dependencies [9c94358]
  - @backstage-community/plugin-announcements-common@0.4.0

## 0.4.4

### Patch Changes

- dd1aed2: fix(ui): Respect MUI theme options for typography, colors

## 0.4.3

### Patch Changes

- 11be6bb: chore(deps): Upgrade to Backstage 1.38
- Updated dependencies [11be6bb]
  - @backstage-community/plugin-announcements-common@0.3.2

## 0.4.2

### Patch Changes

- 1f34951: Upgraded to Backstage release 1.37.
- Updated dependencies [1f34951]
  - @backstage-community/plugin-announcements-common@0.3.1

## 0.4.1

### Patch Changes

- fe62f42: Improved relative date display for scheduled announcements. When the Start At date is set for the current day, it now shows "Scheduled Today" instead of "Occurred X hours ago"

## 0.4.0

### Minor Changes

- 22d99d3: - Added a `start at` field to allow users to set the date when an announcement occurred.
  - Announcements can now be sorted by `createdAt` (default) or `startAt` date, with customizable order (`desc` or `asc`).
  - Updated the New Announcement form to accommodate `start at` and future fields.
  - Added `Created at` and `Start at` columns to the admin view table.

### Patch Changes

- Updated dependencies [22d99d3]
  - @backstage-community/plugin-announcements-common@0.3.0

## 0.3.1

### Patch Changes

- f253ff9: Now exports the default AnnouncementsClient used by the frontend package. Most consumers will continue to consume via the `announcementsApiRef`.

## 0.3.0

### Minor Changes

- 5c2483c: **BREAKING** Fixed a typo in translation keys (announecementsContent → announcementsContent), requiring all references to be updated to prevent missing translations.

## 0.2.0

### Minor Changes

- e06ffa0: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [e06ffa0]
  - @backstage-community/plugin-announcements-common@0.2.0

## 0.1.3

### Patch Changes

- e282a2d: Minor improvements to README documentation
- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-announcements-common@0.1.1
