# @backstage-community/backstage-plugin-announcements-backend

## 0.10.4

### Patch Changes

- a16f8f9: Fixes an issue with the announcements count returning the incorrect value when filters are applied.

  For example, if there are 2 total announcements in the database, and you request a `max` of 1 announcement, the count would still return 2.

  ```ts
  // before
  {
    count: 2,
    announcements: [mostRecentAnnouncement]
  }


  // after
  {
    count: 1,
    announcements: [mostRecentAnnouncement]
  }
  ```

- cfda065: Adds the ability to activate and deactivate an announcement. This should not be a breaking change. All existing announcements will backfill to `active: true`.
- Updated dependencies [cfda065]
  - @backstage-community/backstage-plugin-announcements-common@0.2.8
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.3.3

## 0.10.3

### Patch Changes

- c9be1ca: Adds an integration with @backstage/plugins-signals-backend. New announcements will now be displayed in near real-time if your Backstage instance supports signals.
- Updated dependencies [c9be1ca]
  - @backstage-community/backstage-plugin-announcements-common@0.2.7
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.3.2

## 0.10.2

### Patch Changes

- 75536ca: Internal refactor to remove `export` from unused exported types.

## 0.10.1

### Patch Changes

- 152842c: # Overview

  Adds support for the Backstage event system (@backstage/plugin-events-backend).

  ## Topic

  All events are published to the `announcements` topic.

  ## Event actions

  The following event actions are supported

  ### Announcements

  All announcement payloads include the entire contents of the announcement

  - 'create_announcement': Create a new announcement
  - 'update_announcement': Update an existing announcement
  - 'delete_announcement': Delete an existing announcement

  ### Categories

  All category payloads include the category slug.

  - 'create_category': Create a new category
  - 'delete_category': Delete an existing category

  ## Subscribing to announcement events example

  ```ts
  import { EVENTS_TOPIC_ANNOUNCEMENTS } from '@backstage-community/backstage-plugin-announcements-common';

  events.subscribe({
    id: 'announcements-subscriber',
    topics: [EVENTS_TOPIC_ANNOUNCEMENTS],
    async onEvent(params): Promise<void> {
      console.log('Announcement', params);
    },
  });
  ```

- Updated dependencies [152842c]
  - @backstage-community/backstage-plugin-announcements-common@0.2.6
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.3.1

## 0.10.0

### Minor Changes

- ebcc341: Migrate away from winston logger and old services. Replace with coreServices where posisble. It is possible this will be a breaking change for those who have not migrated to the new backend system.

### Patch Changes

- 071914c: bump dependencies and update to the latest version of backstage (1.31.2)
- Updated dependencies [071914c]
- Updated dependencies [ebcc341]
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.3.0
  - @backstage-community/backstage-plugin-announcements-common@0.2.5

## 0.9.3

### Patch Changes

- Updated dependencies [2bee323]
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.5

## 0.9.2

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1
- Updated dependencies [5d34ab8]
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.4
  - @backstage-community/backstage-plugin-announcements-common@0.2.4

## 0.9.1

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json
- Updated dependencies [9937f08]
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.3
  - @backstage-community/backstage-plugin-announcements-common@0.2.3

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
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.2
  - @backstage-community/backstage-plugin-announcements-common@0.2.2

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
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.1
  - @backstage-community/backstage-plugin-announcements-common@0.2.1

## 0.6.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

### Patch Changes

- Updated dependencies [e811647]
  - @backstage-community/backstage-plugin-announcements-common@0.2.0
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.2.0

## 0.5.4

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.
- ee57cf2: Export collators from search backend module and deprecate the collators coming from `announcements-backend`. Users are recommended to update their imports to use `@backstage-community/backstage-plugin-search-backend-module-announcements`.
- a0cf0a2: Remove unused api code now that service has been migrated to `announcements-node` and collator has been migrated to `search-backend-module-announcements`
- Updated dependencies [2b03aeb]
- Updated dependencies [e5c0685]
- Updated dependencies [ee57cf2]
  - @backstage-community/backstage-plugin-search-backend-module-announcements@0.1.1
  - @backstage-community/backstage-plugin-announcements-common@0.1.4

## 0.5.3

### Patch Changes

- b6c3890: Add support for Backstage New Backend System
- 2896e85: It was a mistake to remove the AnnouncementsCollatorFactory. Users can only migrate to the new search module for annoucements if they are leveraging the new backend system.
- 2c733e7: Add deprecation warning for AnnouncementCollatorFactory. Users should import from the new search module instead (@backstage-community/plugin-search-backend-module-announcements).

## 0.5.2

### Patch Changes

- 35670f3: Upgrade Backstage to 1.22.1
- Updated dependencies [35670f3]
  - @backstage-community/backstage-plugin-announcements-common@0.1.3

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
  - @backstage-community/backstage-plugin-announcements-common@0.1.2

## 0.3.4

### Patch Changes

- 57792bf: Fixed the correct endpoint call by AnnouncementCollatorApi

## 0.3.3

### Patch Changes

- 4f7a351: bump all packages
- Updated dependencies [4f7a351]
  - @backstage-community/backstage-plugin-announcements-common@0.1.1

## 0.2.0

### Minor Changes

- 2f5aa27: Introduce announcement categories

### Patch Changes

- 793d5b9: Bump Backstage dependencies to 1.15.0
- ab3813f: Bump Backstage dependencies
- b8c5c87: Paginate results in the announcements page
- Updated dependencies [793d5b9]
- Updated dependencies [ab3813f]
  - @backstage-community/backstage-plugin-announcements-common@0.0.7

## 0.1.4

### Patch Changes

- 7d25e84: Bump Backstage-related dependencies
- Updated dependencies [7d25e84]
  - @backstage-community/backstage-plugin-announcements-common@0.0.6

## 0.1.3

### Patch Changes

- 0e1d000: Give up on workspace:^ constraints
- 56d5e6d: Try and setup release pipeline to replace 'workspace:\*' version constraints
- Updated dependencies [0e1d000]
- Updated dependencies [56d5e6d]
  - @backstage-community/backstage-plugin-announcements-common@0.0.5

## 0.1.2

### Patch Changes

- Updated dependencies [9bdc37d]
  - @backstage-community/backstage-plugin-announcements-common@0.0.4

## 0.1.1

### Patch Changes

- Updated dependencies [6c9bf32]
  - @backstage-community/backstage-plugin-announcements-common@0.0.3

## 0.1.0

### Minor Changes

- 062aca5: Add permissioning around creating and deleting announcements

### Patch Changes

- 0c12eea: Bump Backstage dependencies
- Updated dependencies [062aca5]
- Updated dependencies [0c12eea]
  - @backstage-community/backstage-plugin-announcements-common@0.0.2

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
