# @backstage-community/plugin-announcements-backend

## 0.9.3

### Patch Changes

- Updated dependencies [2bee323]
  - @backstage-community/plugin-search-backend-module-announcements@0.2.5

## 0.9.2

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1
- Updated dependencies [5d34ab8]
  - @backstage-community/plugin-search-backend-module-announcements@0.2.4
  - @backstage-community/plugin-announcements-common@0.2.4

## 0.9.1

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json
- Updated dependencies [9937f08]
  - @backstage-community/plugin-search-backend-module-announcements@0.2.3
  - @backstage-community/plugin-announcements-common@0.2.3

## 0.9.0

### Minor Changes

- 6089647: Bug Report: Announcement category cannot be deleted in certain scenarios
- 6089647: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

## 0.8.0

### Minor Changes

- b4e2ed3: Able to delete Announcement Categories for following benefits:-

  1. If created by mistake, a user can delete that
  2. Categories doesn't get cluttered

## 0.7.0

### Minor Changes

- d1f456b: Bug Fix: Creating a category with a different slug and title will prevent the announcement from being created #351

## 0.6.4

### Patch Changes

- 656ef61: Update to Backstage version 1.27.1
- Updated dependencies [656ef61]
  - @backstage-community/plugin-search-backend-module-announcements@0.2.2
  - @backstage-community/plugin-announcements-common@0.2.2

## 0.6.3

### Patch Changes

- a949307: fix: the most recent release version of this package will error with a "workspace:\*" error.

## 0.6.2

### Patch Changes

- dd2e1b3: There were not protections against anyone creating categories. Now users will be required to have announcements.create permissions to create one.

## 0.6.1

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)
- Updated dependencies [3a7ae1a]
  - @backstage-community/plugin-search-backend-module-announcements@0.2.1
  - @backstage-community/plugin-announcements-common@0.2.1

## 0.6.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @backstage-community/plugin-announcements-common@0.2.0
  - @backstage-community/plugin-search-backend-module-announcements@0.2.0

## 0.5.4

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- ee57cf2: Export collators from search backend module and deprecate the collators coming from `announcements-backend`. Users are recommended to update their imports to use `@backstage-community/plugin-search-backend-module-announcements`.
- a0cf0a2: Remove unused api code now that service has been migrated to `announcements-node` and collator has been migrated to `search-backend-module-announcements`
- Updated dependencies [2b03aeb]
- Updated dependencies [e5c0685]
- Updated dependencies [ee57cf2]
  - @backstage-community/plugin-search-backend-module-announcements@0.1.1
  - @backstage-community/plugin-announcements-common@0.1.4

## 0.5.3

### Patch Changes

- b6c3890: Add support for Backstage New Backend System
- 2896e85: It was a mistake to remove the AnnouncementsCollatorFactory. Users can only migrate to the new search module for annoucements if they are leveraging the new backend system.
- 2c733e7: Add deprecation warning for AnnouncementCollatorFactory. Users should import from the new search module instead (@backstage-community/plugin-search-backend-module-announcements).

## 0.5.2

### Patch Changes

- 35670f3: Upgrade Backstage to 1.22.1
- Updated dependencies [35670f3]
  - @backstage-community/plugin-announcements-common@0.1.3

## 0.5.1

### Patch Changes

- 857c323: set correct build database migrations folder path

## 0.5.0

### Minor Changes

- 4968543: The backend now contains a local seeded database with announcements and categories. The README file was updated to include instructions on how to set things up. Minor documentation edits were made across the project to align with the format updates in the backend's readme.

## 0.4.0

### Minor Changes

- 43e6b6a: Exposes the announcements plugin's permissions in a metadata endpoint

### Patch Changes

- bce49e0: Improves test coverage significantly for the backend plugin
- 24df174: chore: bump dev dependencies where possible
- c81ae81: Fix AnnouncementCollatorApi iterable error

## 0.3.5

### Patch Changes

- 90a19ec: upgrade backstage to v1.18.0
- c3c379d: bump backstage to v1.16.0
- Updated dependencies [90a19ec]
- Updated dependencies [c3c379d]
  - @backstage-community/plugin-announcements-common@0.1.2

## 0.3.4

### Patch Changes

- 57792bf: Fixed the correct endpoint call by AnnouncementCollatorApi

## 0.3.3

### Patch Changes

- 4f7a351: bump all packages
- Updated dependencies [4f7a351]
  - @backstage-community/plugin-announcements-common@0.1.1

## 0.2.0

### Minor Changes

- 2f5aa27: Introduce announcement categories

### Patch Changes

- 793d5b9: Bump Backstage dependencies to 1.15.0
- ab3813f: Bump Backstage dependencies
- b8c5c87: Paginate results in the announcements page
- Updated dependencies [793d5b9]
- Updated dependencies [ab3813f]
  - @backstage-community/plugin-announcements-common@0.0.7

## 0.1.4

### Patch Changes

- 7d25e84: Bump Backstage-related dependencies
- Updated dependencies [7d25e84]
  - @backstage-community/plugin-announcements-common@0.0.6

## 0.1.3

### Patch Changes

- 0e1d000: Give up on workspace:^ constraints
- 56d5e6d: Try and setup release pipeline to replace 'workspace:\*' version constraints
- Updated dependencies [0e1d000]
- Updated dependencies [56d5e6d]
  - @backstage-community/plugin-announcements-common@0.0.5

## 0.1.2

### Patch Changes

- Updated dependencies [9bdc37d]
  - @backstage-community/plugin-announcements-common@0.0.4

## 0.1.1

### Patch Changes

- Updated dependencies [6c9bf32]
  - @backstage-community/plugin-announcements-common@0.0.3

## 0.1.0

### Minor Changes

- 062aca5: Add permissioning around creating and deleting announcements

### Patch Changes

- 0c12eea: Bump Backstage dependencies
- Updated dependencies [062aca5]
- Updated dependencies [0c12eea]
  - @backstage-community/plugin-announcements-common@0.0.2

## 0.0.5

### Patch Changes

- c6b1bda: Fix announcement link in search results

## 0.0.4

### Patch Changes

- 785ac0b: Bump dependencies to match Backstage 1.8.0

## 0.0.3

### Patch Changes

- 81aeb2a: Fix announcements edit endpoint
- a5e68b3: Fix DateTime handling differences across Postgres and sqlite
- b518090: Adjust log levels in search collator

## 0.0.2

### Patch Changes

- ff90090: Fix dev environment
