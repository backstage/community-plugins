# @procore-oss/backstage-plugin-announcements

## 0.10.0

### Minor Changes

- 3c04265: Add react-dom & types/react as peer dependencies

### Patch Changes

- 7158f76: Make entity card appear on components & systems only by default in new FE system

## 0.9.2

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1
- Updated dependencies [5d34ab8]
  - @procore-oss/backstage-plugin-announcements-common@0.2.4
  - @procore-oss/backstage-plugin-announcements-react@0.4.2

## 0.9.1

### Patch Changes

- 9937f08: - Adds support for Backstage's new frontend system, available via the `/alpha` sub-path export.
- Updated dependencies [9937f08]
  - @procore-oss/backstage-plugin-announcements-common@0.2.3
  - @procore-oss/backstage-plugin-announcements-react@0.4.1

## 0.9.0

### Minor Changes

- 6089647: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

### Patch Changes

- Updated dependencies [6089647]
  - @procore-oss/backstage-plugin-announcements-react@0.4.0

## 0.8.0

### Minor Changes

- b4e2ed3: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

### Patch Changes

- Updated dependencies [b4e2ed3]
  - @procore-oss/backstage-plugin-announcements-react@0.3.0

## 0.7.0

### Minor Changes

- d1f456b: Bug Fix: Creating a category with a different slug and title will prevent the announcement from being created #351

## 0.6.6

### Patch Changes

- fbbc5e3: A frontend bugfix to fix paging on the AnnouncementsPage

## 0.6.5

### Patch Changes

- 656ef61: Update to Backstage version 1.27.1
- 1a669e3: Added two new hooks (useAnnouncements and useCategories) to refactor out some repetive calls to the announcementsApi on the frontend.

  While not the primary objective, these will be exported from '@procore-oss/backstage-plugin-announcements-react' so adopters _could_ retrieve announcements and display them as they see fit.

- e9e446f: Adds the ability to create new categories dynamically from the new announcement form
- Updated dependencies [656ef61]
- Updated dependencies [1a669e3]
  - @procore-oss/backstage-plugin-announcements-common@0.2.2
  - @procore-oss/backstage-plugin-announcements-react@0.2.2

## 0.6.4

### Patch Changes

- 2a3842e: This package should have been bumped to 0.6.4 to release a fix for the `workspace` issue.

## 0.6.3

### Patch Changes

- a949307: fix: the most recent release version of this package will error with a "workspace:\*" error.

## 0.6.2

- dc3838e: Added buttonOptions to router props so that this can be overridden
- c0ce990: Added property `variant` to `AnnouncementsCard`

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)
- 965e089: Added a property for AnnouncementsPage named `buttonOptions.name` to `AnnouncementCreateButtonProps` which will adjust what is shown in the "New announcement" LinkButton. eg. `buttonOptions.name = Pizza` will update LinkButton to "New Pizza"
- Updated dependencies [3a7ae1a]
  - @procore-oss/backstage-plugin-announcements-common@0.2.1
  - @procore-oss/backstage-plugin-announcements-react@0.2.1

## 0.6.1

### Patch Changes

- 96b8726: Added `category` to Router props to allow filtering on individual routes.

## 0.6.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @procore-oss/backstage-plugin-announcements-common@0.2.0
  - @procore-oss/backstage-plugin-announcements-react@0.2.0

## 0.5.0

### Minor Changes

- 4a76b6c: Introducing the <AnnouncementsTimeline /> component, a different way to display announcements to your end users.

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- f7b3b0b: Migrate to `announcementsApiRef` and `AnnouncementApi` interface from `@procore-oss/backstage-plugin-announcements-react` and mark existing exports as deprecated.

  Users should now import both `announcementsApiRef` and `AnnouncementApi` from `@procore-oss/backstage-plugin-announcements-react`. Existing exports will be removed in a future release.

- Updated dependencies [2b03aeb]
  - @procore-oss/backstage-plugin-announcements-common@0.1.4
  - @procore-oss/backstage-plugin-announcements-react@0.1.2

## 0.4.6

### Patch Changes

- d29a587: Use display name in Announcement Card

## 0.4.5

### Patch Changes

- 4a050ac: Support for React 18
- 7f3e663: bump @uiw/react-md-editor to latest version

## 0.4.4

### Patch Changes

- 35670f3: Upgrade Backstage to 1.22.1
- Updated dependencies [35670f3]
  - @procore-oss/backstage-plugin-announcements-common@0.1.3

## 0.4.3

### Patch Changes

- ff9753d: Use Entity display name

## 0.4.2

### Patch Changes

- b4827fa: export announcementsApiRef

## 0.4.1

### Patch Changes

- ee9984f: Allows a user to specify the title length for the list of Announcement cards. This is useful if you would like to truncate all titles to keep cards consistent
- 38eab72: Announcement cards will now display truncated titles with an ellipsis. Hovering over the title will display a tooltip with the full title.

## 0.4.0

### Minor Changes

- 95c94c0: Update announcement card layout. That fixes color font that was incorrect with light theme

## 0.3.1

### Patch Changes

- 4968543: The backend now contains a local seeded database with announcements and categories. The README file was updated to include instructions on how to set things up. Minor documentation edits were made across the project to align with the format updates in the backend's readme.

## 0.3.0

### Minor Changes

- 668636c: This change modifies the announcements plugin to use the backstage fetch api, making it compatible with any backstage implementation using any fetch api customization.

### Patch Changes

- 24df174: chore: bump dev dependencies where possible

## 0.2.3

### Patch Changes

- 90a19ec: upgrade backstage to v1.18.0
- c3c379d: bump backstage to v1.16.0
- Updated dependencies [90a19ec]
- Updated dependencies [c3c379d]
  - @procore-oss/backstage-plugin-announcements-common@0.1.2

## 0.2.2

### Patch Changes

- 4f7a351: bump all packages
- Updated dependencies [4f7a351]
  - @procore-oss/backstage-plugin-announcements-common@0.1.1

## 0.1.0

### Minor Changes

- 2f5aa27: Introduce announcement categories

### Patch Changes

- e9101d0: Display announcements by category for the banner and card
- 793d5b9: Bump Backstage dependencies to 1.15.0
- ab3813f: Bump Backstage dependencies
- b8c5c87: Paginate results in the announcements page
- 3ac02c7: Support displaying multiple announcements using the NewAnnouncementBanner component
- 0868ffc: Cleanup the announcement form style
- cca69ec: Prevent the submission of empty announcements
- Updated dependencies [793d5b9]
- Updated dependencies [ab3813f]
  - @procore-oss/backstage-plugin-announcements-common@0.0.7

## 0.0.14

### Patch Changes

- 528302a: Display a confirmation dialog before deleting an announcement
- a443bf3: Redirect the user after creating a new announcement
- 5023f75: Tweak the announcements card style

## 0.0.13

### Patch Changes

- d51a982: Fix search results display for Backstage 1.11.x

## 0.0.12

### Patch Changes

- f427a96: Display a popover when hovering on the publisher's name
- fead58e: Page titles and subtitles are now customizable
- 7d25e84: Bump Backstage-related dependencies
- ba1e9ec: Allow the "New announcement banner" component to be used as a floating notification
- 00753b7: Fix routes definition
- 60babbc: Make the themeId configurable on all pages
- Updated dependencies [7d25e84]
  - @procore-oss/backstage-plugin-announcements-common@0.0.6

## 0.0.11

### Patch Changes

- 0e1d000: Give up on workspace:^ constraints
- 56d5e6d: Try and setup release pipeline to replace 'workspace:\*' version constraints
- Updated dependencies [0e1d000]
- Updated dependencies [56d5e6d]
  - @procore-oss/backstage-plugin-announcements-common@0.0.5

## 0.0.10

### Patch Changes

- Updated dependencies [9bdc37d]
  - @procore-oss/backstage-plugin-announcements-common@0.0.4

## 0.0.9

### Patch Changes

- Updated dependencies [6c9bf32]
  - @procore-oss/backstage-plugin-announcements-common@0.0.3

## 0.0.8

### Patch Changes

- 0c12eea: Bump Backstage dependencies
- Updated dependencies [062aca5]
- Updated dependencies [0c12eea]
  - @procore-oss/backstage-plugin-announcements-common@0.0.2

## 0.0.7

### Patch Changes

- 127e248: Display announcement author as a link to its catalog page

## 0.0.6

### Patch Changes

- 785ac0b: Bump dependencies to match Backstage 1.8.0

## 0.0.5

### Patch Changes

- 4bfeb8a: Make a few component titles customizable
- b679760: Use Cards instead of a table for the announcements page

## 0.0.4

### Patch Changes

- 24b061c: Expose NewAnnouncementBanner component

## 0.0.3

### Patch Changes

- b8ccaf5: Make number of maximum announcements configurable in AnnouncementsCard
- 06852fe: Introduce a NewAnnouncementBanner component
- cb34f2a: Define an empty state for the AnnouncementsCard

## 0.0.2

### Patch Changes

- ff90090: Fix dev environment
