# @procore-oss/backstage-plugin-announcements-react

## 0.4.1

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json
- Updated dependencies [9937f08]
  - @procore-oss/backstage-plugin-announcements-common@0.2.3

## 0.4.0

### Minor Changes

- 6089647: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

## 0.3.0

### Minor Changes

- b4e2ed3: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

## 0.2.2

### Patch Changes

- 656ef61: Update to Backstage version 1.27.1
- 1a669e3: Added two new hooks (useAnnouncements and useCategories) to refactor out some repetive calls to the announcementsApi on the frontend.

  While not the primary objective, these will be exported from '@procore-oss/backstage-plugin-announcements-react' so adopters _could_ retrieve announcements and display them as they see fit.

- Updated dependencies [656ef61]
  - @procore-oss/backstage-plugin-announcements-common@0.2.2

## 0.2.1

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)
- Updated dependencies [3a7ae1a]
  - @procore-oss/backstage-plugin-announcements-common@0.2.1

## 0.2.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @procore-oss/backstage-plugin-announcements-common@0.2.0

## 0.1.2

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- Updated dependencies [2b03aeb]
  - @procore-oss/backstage-plugin-announcements-common@0.1.4

## 0.1.1

### Patch Changes

- e2e1757: New react plugin to support new architecture
