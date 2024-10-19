# @backstage-community/backstage-plugin-announcements-react

## 0.4.7

### Patch Changes

- cfda065: Adds the ability to filter to only show active announcements

  This should not be a breaking change. The `<AnnouncementsPage />` component now accepts an optional `hideInactive` prop that will hide inactive announcements. The default behavior is to show all announcements, or in other words, `hideInactive: false`.

  ```tsx
   <AnnouncementsPage
    title="Announcements"
    ...
    hideInactive
  />
  ```

- Updated dependencies [cfda065]
  - @backstage-community/backstage-plugin-announcements-common@0.2.8

## 0.4.6

### Patch Changes

- 58a4cc2: Migrate from Material UI v4 to v5.

## 0.4.5

### Patch Changes

- Updated dependencies [c9be1ca]
  - @backstage-community/backstage-plugin-announcements-common@0.2.7

## 0.4.4

### Patch Changes

- Updated dependencies [152842c]
  - @backstage-community/backstage-plugin-announcements-common@0.2.6

## 0.4.3

### Patch Changes

- 071914c: bump dependencies and update to the latest version of backstage (1.31.2)
- Updated dependencies [071914c]
  - @backstage-community/backstage-plugin-announcements-common@0.2.5

## 0.4.2

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1
- Updated dependencies [5d34ab8]
  - @backstage-community/backstage-plugin-announcements-common@0.2.4

## 0.4.1

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json
- Updated dependencies [9937f08]
  - @backstage-community/backstage-plugin-announcements-common@0.2.3

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

  While not the primary objective, these will be exported from '@backstage-community/backstage-plugin-announcements-react' so adopters _could_ retrieve announcements and display them as they see fit.

- Updated dependencies [656ef61]
  - @backstage-community/backstage-plugin-announcements-common@0.2.2

## 0.2.1

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)
- Updated dependencies [3a7ae1a]
  - @backstage-community/backstage-plugin-announcements-common@0.2.1

## 0.2.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @backstage-community/backstage-plugin-announcements-common@0.2.0

## 0.1.2

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- Updated dependencies [2b03aeb]
  - @backstage-community/backstage-plugin-announcements-common@0.1.4

## 0.1.1

### Patch Changes

- e2e1757: New react plugin to support new architecture
