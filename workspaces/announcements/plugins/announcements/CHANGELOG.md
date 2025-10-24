# @backstage-community/plugin-announcements

## 0.16.0

### Minor Changes

- 1c076d9: - Centered text for empty tables in:
  - Announcements
  - Category
  - Tags
  - Properly mounted in the frontend the `/tags` path
  - Updated `CategoriesPage` and `TagsPage` in order to display the `ContextMenu`
  - Added titleLength prop in order to truncate title on `AnnouncementDetails`
  - Fixed insert of Categories from `CategoriesPage` and clean up on dialog
  - Added in the `NewAnnouncementBanner` a `cardOptions={{titleLength,excerptLength }}` props, this would allow to truncate text. Default is 50.
  - Now in the `NewAnnouncementBanner` when the title get clicked, the alert is dismissed as user navigate to alert details

### Patch Changes

- Updated dependencies [95470f7]
  - @backstage-community/plugin-announcements-common@0.12.1
  - @backstage-community/plugin-announcements-react@0.14.1

## 0.15.0

### Minor Changes

- cd040b2: Backstage version bump to v1.44.0

### Patch Changes

- Updated dependencies [cd040b2]
  - @backstage-community/plugin-announcements-common@0.12.0
  - @backstage-community/plugin-announcements-react@0.14.0

## 0.14.0

### Minor Changes

- d34e875: Added updated_at field, extended sorting capabilities NewAnnouncementsBanner

### Patch Changes

- Updated dependencies [d34e875]
  - @backstage-community/plugin-announcements-common@0.11.0
  - @backstage-community/plugin-announcements-react@0.13.0

## 0.13.1

### Patch Changes

- 93bb787: Fixed the typings for the Announcements new frontend system plugin, which previously prevented correct overriding.
- 6efe1a3: - Fixed table rendering in `<AnnouncementsPage markdownRenderer="md-editor" />`. Table styling was not correctly applied when using the Backstage Light theme.
  - Updated `@uiw/react-md-editor` dependency to `^4.0.8`.

## 0.13.0

### Minor Changes

- aca5bee: Adds `defaultInactive` prop to `AnnouncementsPage`, to be used as the initial form value of `active` for new announcements.
- 58ccd64: Fixed handling of `active` prop in NewAnnouncementBanner
  Extended signal and notification on update when the annoucencement is activated
  Updated `EditAnnoucementPage` to navigate to root path as the announcement creation page
  Updated `EditAnnoucementPage` alertApi on success to be transient
- 2d1724c: Backstage version bump to v1.43.2

### Patch Changes

- 0d56a66: Added search extensions for new frontend system
- Updated dependencies [2d1724c]
  - @backstage-community/plugin-announcements-common@0.10.0
  - @backstage-community/plugin-announcements-react@0.12.0

## 0.12.1

### Patch Changes

- 2007a96: Fixed #5322 that caused `500` errors when fetching existing announcements with null `until_date`.
- Updated dependencies [2007a96]
  - @backstage-community/plugin-announcements-common@0.9.1
  - @backstage-community/plugin-announcements-react@0.11.1

## 0.12.0

### Minor Changes

- 4a3e603: Added support for an `until_date` field in announcements and introduced a new `current` filter.
- 4a89fd8: With these changes, notifications can be enabled whenever new announcement is created. Announcement notifications are disabled by-default. For details, about notification, please refer [`Notifications`](https://backstage.io/docs/notifications/) docs.

  announcements: integration with notifications #4378

### Patch Changes

- 92b9e8c: Fix a bug in the Edit announcement page where the page does not update the announcement if the announcement is missing a category
- Updated dependencies [4a3e603]
- Updated dependencies [4a89fd8]
  - @backstage-community/plugin-announcements-common@0.9.0
  - @backstage-community/plugin-announcements-react@0.11.0

## 0.11.0

### Minor Changes

- e121abb: Backstage version bump to v1.42.3

### Patch Changes

- d70723f: Allow creating new announcement category for edit
- Updated dependencies [e121abb]
- Updated dependencies [d70723f]
  - @backstage-community/plugin-announcements-common@0.8.0
  - @backstage-community/plugin-announcements-react@0.10.0

## 0.10.2

### Patch Changes

- 7ad0cd0: Fixes an issue where an empty list of userOwnershipRefs causes excessive api calls to the catalog when creating a new announcement.
- Updated dependencies [7ad0cd0]
  - @backstage-community/plugin-announcements-react@0.9.1

## 0.10.1

### Patch Changes

- 0ab4439: Updated the New Frontend System NavItem to use the `RecordVoiceOverIcon` instead of the `NotificationsIcon` to avoid confusion with the Backstage Notifications NavItem
- 1a08ba6: Fixed an issue where your would get a "Routing context not available" error when using the New Frontend System

## 0.10.0

### Minor Changes

- bb76f4e: This change introduces tag filtering to announcements, allowing users to filter by tag by clicking on a tag on an announcement card.
- 220cc20: Backstage version bump to v1.41.1

### Patch Changes

- dc03b75: Remove redundant `EntityPeekAheadPopover` when hovering over user or group entity.
- 477eeb0: Reorganized the Create Announcement form: optional fields have been moved below the Markdown editor for improved layout. This change also includes MUI component updates, upgrading them to MUI v5.
- ee361a8: Removed a redundant inner check for `tags` existence and length.
- Updated dependencies [bb76f4e]
- Updated dependencies [220cc20]
  - @backstage-community/plugin-announcements-react@0.9.0
  - @backstage-community/plugin-announcements-common@0.7.0

## 0.9.0

### Minor Changes

- 775d236: Backstage version bump to v1.40.2

### Patch Changes

- Updated dependencies [775d236]
  - @backstage-community/plugin-announcements-common@0.6.0
  - @backstage-community/plugin-announcements-react@0.8.0

## 0.8.0

### Minor Changes

- 8c803d8: Added support for tags in announcements

### Patch Changes

- Updated dependencies [8c803d8]
  - @backstage-community/plugin-announcements-react@0.7.0
  - @backstage-community/plugin-announcements-common@0.5.1

## 0.7.2

### Patch Changes

- 822489e: Fixed missing markdownRenderer prop in router that prevented setting the Markdown renderer `backstage` or `md-editor`.

## 0.7.1

### Patch Changes

- 6a14453: Add support for configurable markdown rendering with two options: "backstage" (default, theme-consistent) and "md-editor" (WYSIWYG-like rendering with richer markdown support)
- b5402a7: Fix pagination issue when fetching groups. This resolves the issue where the "On-Behalf" team dropdown always displayed only 10 groups.
- Updated dependencies [b5402a7]
  - @backstage-community/plugin-announcements-react@0.6.1

## 0.7.0

### Minor Changes

- 7e38fa0: Backstage version bump to v1.39.1

### Patch Changes

- dc57fe9: Optimize query by filtering only entries with `kind: group`. Add `displayName` to the "On behalf of" dropdown for easier group identification and selection.
- Updated dependencies [7e38fa0]
- Updated dependencies [dc57fe9]
  - @backstage-community/plugin-announcements-common@0.5.0
  - @backstage-community/plugin-announcements-react@0.6.0

## 0.6.1

### Patch Changes

- e4bd3e6: remove direct dependency on '@types/node'

## 0.6.0

### Minor Changes

- 9c94358: Added support for submitting announcements on behalf of a team the user is a member of.
  This field is optional. if not specified, the announcement will be submitted using the current publisher user.

### Patch Changes

- Updated dependencies [9c94358]
  - @backstage-community/plugin-announcements-common@0.4.0
  - @backstage-community/plugin-announcements-react@0.5.0

## 0.5.10

### Patch Changes

- dd1aed2: fix(ui): Respect MUI theme options for typography, colors
- Updated dependencies [dd1aed2]
  - @backstage-community/plugin-announcements-react@0.4.4

## 0.5.9

### Patch Changes

- ecfbf02: Remove legacy React packages in preparation for React 19 upgrade.

## 0.5.8

### Patch Changes

- 11be6bb: chore(deps): Upgrade to Backstage 1.38
- Updated dependencies [11be6bb]
  - @backstage-community/plugin-announcements-common@0.3.2
  - @backstage-community/plugin-announcements-react@0.4.3

## 0.5.7

### Patch Changes

- 32b99b3: - Add `hideStartAt` React prop to allow hiding the "Start at" date label on announcements card

  ```diff
  - <AnnouncementsCard max={2} />
  + <AnnouncementsCard max={2} hideStartAt />
  ```

## 0.5.6

### Patch Changes

- 1f34951: Upgraded to Backstage release 1.37.
- Updated dependencies [1f34951]
  - @backstage-community/plugin-announcements-common@0.3.1
  - @backstage-community/plugin-announcements-react@0.4.2

## 0.5.5

### Patch Changes

- 3d819b6: Replaced HTML elements with MUI components in `AnnouncementsCard` and `AnnouncementsPage` for uniform styling.

## 0.5.4

### Patch Changes

- fe62f42: Improved relative date display for scheduled announcements. When the Start At date is set for the current day, it now shows "Scheduled Today" instead of "Occurred X hours ago"
- Updated dependencies [fe62f42]
  - @backstage-community/plugin-announcements-react@0.4.1

## 0.5.3

### Patch Changes

- 3b99ef7: - Fixed Active field column in announcements admin table, which was preventing proper sorting by `active` state.
  - Enhanced readability of the Active status in the admin announcements table using `Status` components.

## 0.5.2

### Patch Changes

- d1e46c9: Updated context menu visibility logic to dynamically show or hide options based on the create permission.

## 0.5.1

### Patch Changes

- a8e2f2c: Updated dependency `@material-ui/lab` to `4.0.0-alpha.61`.
  Updated dependency `@mui/icons-material` to `5.16.14`.
  Updated dependency `@mui/material` to `5.16.14`.
  Updated dependency `@mui/styles` to `5.16.14`.
  Updated dependency `@mui/x-charts` to `6.19.8`.
  Updated dependency `@mui/lab` to `5.0.0-alpha.175`.

## 0.5.0

### Minor Changes

- 22d99d3: - Added a `start at` field to allow users to set the date when an announcement occurred.
  - Announcements can now be sorted by `createdAt` (default) or `startAt` date, with customizable order (`desc` or `asc`).
  - Updated the New Announcement form to accommodate `start at` and future fields.
  - Added `Created at` and `Start at` columns to the admin view table.

### Patch Changes

- Updated dependencies [22d99d3]
  - @backstage-community/plugin-announcements-common@0.3.0
  - @backstage-community/plugin-announcements-react@0.4.0

## 0.4.0

### Minor Changes

- f253ff9: **breaking** - previously deprecated exports have been removed

### Patch Changes

- Updated dependencies [f253ff9]
  - @backstage-community/plugin-announcements-react@0.3.1

## 0.3.0

### Minor Changes

- 5c2483c: **BREAKING** Fixed a typo in translation keys (announecementsContent → announcementsContent), requiring all references to be updated to prevent missing translations.

### Patch Changes

- Updated dependencies [5c2483c]
  - @backstage-community/plugin-announcements-react@0.3.0

## 0.2.0

### Minor Changes

- e06ffa0: Backstage version bump to v1.35.1

### Patch Changes

- Updated dependencies [e06ffa0]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-announcements-react@0.2.0

## 0.1.6

### Patch Changes

- 9cea4f3: Removed divider from AnnouncementSearchResultListItem

## 0.1.5

### Patch Changes

- 1909e4d: Added announcement ID to the useAsync dependency array in the AnnouncementPage component.

  This fixes an issue where the AnnouncementPage component did not re-fetch the announcement details when the ID in the routing path changed. As a result the user who was on the AnnouncementPage couldn't see the details of the next announcement they accessed, e.g. from the search dialogue.

- ef67a29: Fixed bug in AnnouncementPage component where subheader spacing was missing

## 0.1.4

### Patch Changes

- e282a2d: Minor improvements to README documentation
- Updated dependencies [e282a2d]
  - @backstage-community/plugin-announcements-common@0.1.3
  - @backstage-community/plugin-announcements-react@0.1.3

## 0.1.3

### Patch Changes

- d08164d: Exported missing items to match documentation

## 0.1.2

### Patch Changes

- 126b459: Minor bump to fix release process - this should kick off the first release of the announcements plugins under the @backstage-community scope.
- Updated dependencies [126b459]
  - @backstage-community/plugin-announcements-common@0.1.2
  - @backstage-community/plugin-announcements-react@0.1.2

## 0.1.1

### Patch Changes

- 48094fc: Bump all dependencies to be in line with Backstage v1.34.2. This is the first versioned release of the announcement plugins under the `@backstage-community` scope.
- Updated dependencies [48094fc]
  - @backstage-community/plugin-announcements-common@0.1.1
  - @backstage-community/plugin-announcements-react@0.1.1
