# Support for events

The announcements plugin supports the Backstage Event system.

```ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/events-backend'));
backend.add(import('@backstage-community/plugin-announcements-backend'));

backend.start();
```

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
