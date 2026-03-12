# @backstage-community/plugin-announcements-react

## 0.22.0

### Minor Changes

- 8b42b6b: Backstage version bump to v1.48.2

### Patch Changes

- Updated dependencies [8b42b6b]
  - @backstage-community/plugin-announcements-common@0.18.0

## 0.21.0

### Minor Changes

- 57c349e: `AnnouncementsOptions` has been dropped as an optional arg for the `useAnnouncements` hook in favor of handling state and dependencies internally.

## 0.20.0

### Minor Changes

- 99b4b52: Backstage version bump to v1.47.2

### Patch Changes

- 44a0337: Add translation support for error message when trying to create a category that already exists
- 6f6d4c8: Add missing translation for "Send notification" in the announcement form
- Updated dependencies [99b4b52]
  - @backstage-community/plugin-announcements-common@0.17.0

## 0.19.0

### Minor Changes

- c299df2: Backstage version bump to v1.47.1

### Patch Changes

- 14ea727: Lowercases announcement in the "Create Announcement" button label translation. This now matches category and tag buttons.
- Updated dependencies [c299df2]
  - @backstage-community/plugin-announcements-common@0.16.0

## 0.18.2

### Patch Changes

- d901927: Removed unused dependencies from the package
- ee5069b: Added translation support for announcements filter bar

## 0.18.1

### Patch Changes

- a6d55dd: Add translation for "Back to admin" button text
- a065bb2: Add translation support for the message shown when deleting an announcement

## 0.18.0

### Minor Changes

- b9c2943: Backstage version bump to v1.46.1

### Patch Changes

- d5dc6b3: Remove limit and improve performance when fetching teams from catalog by using `getEntitiesByRefs`. This also resolves issues where teams beyond the default page size limit were not being retrieved.
- ce95092: Added translations support for the nfs view announcement page
- Updated dependencies [b9c2943]
  - @backstage-community/plugin-announcements-common@0.15.0

## 0.17.0

### Minor Changes

- 411e4c6: Backstage version bump to v1.46.0.
  This release includes fix for frontend error `Package subpath './' is not defined by "exports"`.

### Patch Changes

- Updated dependencies [411e4c6]
  - @backstage-community/plugin-announcements-common@0.14.0

## 0.16.0

### Minor Changes

- 40b8d32: Internal refactor to consolidate delete dialog state management in the admin portal. Refactoring categories and tags to the shared component added support for translations which was previously missing.

  The refactor includes a new set of translation keys for the generic delete dialog.

  ### Translation Changes

  Added new translation keys for the delete dialog:

  - `confirmDeleteDialog.title`
  - `confirmDeleteDialog.cancel`
  - `confirmDeleteDialog.delete`

  Deprecated the following translation keys:

  - `deleteDialog.title`
  - `deleteDialog.cancel`
  - `deleteDialog.delete`

### Patch Changes

- 6b45ee7: Adds a new useAnnouncementsPermissions hook users can leverage when needing quick access to all permissions, something we commonly do throughout the admin portal. All components now leverage this hook instead of using the usePermission hook directly.

## 0.15.0

### Minor Changes

- bda0481: Backstage version bump to v1.45.1

### Patch Changes

- Updated dependencies [bda0481]
  - @backstage-community/plugin-announcements-common@0.13.0

## 0.14.1

### Patch Changes

- Updated dependencies [95470f7]
  - @backstage-community/plugin-announcements-common@0.12.1

## 0.14.0

### Minor Changes

- cd040b2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [cd040b2]
  - @backstage-community/plugin-announcements-common@0.12.0

## 0.13.0

### Minor Changes

- d34e875: Added updated_at field, extended sorting capabilities NewAnnouncementsBanner

### Patch Changes

- Updated dependencies [d34e875]
  - @backstage-community/plugin-announcements-common@0.11.0

## 0.12.0

### Minor Changes

- 2d1724c: Backstage version bump to v1.43.2

### Patch Changes

- Updated dependencies [2d1724c]
  - @backstage-community/plugin-announcements-common@0.10.0

## 0.11.1

### Patch Changes

- Updated dependencies [2007a96]
  - @backstage-community/plugin-announcements-common@0.9.1

## 0.11.0

### Minor Changes

- 4a3e603: Added support for an `until_date` field in announcements and introduced a new `current` filter.

### Patch Changes

- Updated dependencies [4a3e603]
- Updated dependencies [4a89fd8]
  - @backstage-community/plugin-announcements-common@0.9.0

## 0.10.0

### Minor Changes

- e121abb: Backstage version bump to v1.42.3

### Patch Changes

- d70723f: Allow creating new announcement category for edit
- Updated dependencies [e121abb]
  - @backstage-community/plugin-announcements-common@0.8.0

## 0.9.1

### Patch Changes

- 7ad0cd0: Fixes an issue where an empty list of userOwnershipRefs causes excessive api calls to the catalog when creating a new announcement.

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
