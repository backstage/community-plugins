# @backstage-community/backstage-plugin-announcements-common

## 0.2.8

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

## 0.2.7

### Patch Changes

- c9be1ca: Adds an integration with @backstage/plugins-signals-backend. New announcements will now be displayed in near real-time if your Backstage instance supports signals.

## 0.2.6

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

## 0.2.5

### Patch Changes

- 071914c: bump dependencies and update to the latest version of backstage (1.31.2)

## 0.2.4

### Patch Changes

- 5d34ab8: Update to Backstage 1.30.1

## 0.2.3

### Patch Changes

- 9937f08: - Adds missing backstage metadata to package.json

## 0.2.2

### Patch Changes

- 656ef61: Update to Backstage version 1.27.1

## 0.2.1

### Patch Changes

- 3a7ae1a: Bump all packages to latest stable release of Backstage (1.26.4)

## 0.2.0

### Minor Changes

- e811647: upgrade to 1.25.0 and integrate new authentication system

## 0.1.4

### Patch Changes

- 2b03aeb: Consolidate duplicated types into the common package.

## 0.1.3

### Patch Changes

- 35670f3: Upgrade Backstage to 1.22.1

## 0.1.2

### Patch Changes

- 90a19ec: upgrade backstage to v1.18.0
- c3c379d: bump backstage to v1.16.0

## 0.1.1

### Patch Changes

- 4f7a351: bump all packages

## 0.0.7

### Patch Changes

- 793d5b9: Bump Backstage dependencies to 1.15.0
- ab3813f: Bump Backstage dependencies

## 0.0.6

### Patch Changes

- 7d25e84: Bump Backstage-related dependencies

## 0.0.5

### Patch Changes

- 0e1d000: Give up on workspace:^ constraints
- 56d5e6d: Try and setup release pipeline to replace 'workspace:\*' version constraints

## 0.0.4

### Patch Changes

- 9bdc37d: Make announcements-common public

## 0.0.3

### Patch Changes

- 6c9bf32: New release please

## 0.0.2

### Patch Changes

- 062aca5: Add permissioning around creating and deleting announcements
- 0c12eea: Bump Backstage dependencies
