# Integration with `@backstage/plugin-search`

## New Backend System Setup

Add the new module to your backend app:

```bash
yarn add --cwd packages/backend @backstage-community/backstage-plugin-search-backend-module-announcements
```

Update `packages/backend/src/index.ts` to import announcements search module and register it with the backend:

```ts
// ...
const backend = createBackend();

// ...

backend.add(import('@backstage-community/plugin-announcements-backend'));
backend.add(
  import(
    '@backstage-community/backstage-plugin-search-backend-module-announcements'
  ),
);
// ...
```

## Old Backend System Setup

Enable announcements indexing in the search engine:

```typescript
// packages/backend/src/plugins/search.ts
import { AnnouncementCollatorFactory } from '@backstage-community/plugin-announcements-backend';

export default async function createPlugin({
  logger,
  permissions,
  discovery,
  config,
  tokenManager,
}: PluginEnvironment) {
  // Initialize a connection to a search engine.
  const searchEngine = await ElasticSearchSearchEngine.fromConfig({
    logger,
    config,
  });
  const indexBuilder = new IndexBuilder({ logger, searchEngine });

  // …

  const tenMinutesSchedule = env.scheduler.createScheduledTaskRunner({
    frequency: Duration.fromObject({ minutes: 10 }),
    timeout: Duration.fromObject({ minutes: 15 }),
    // A 3 second delay gives the backend server a chance to initialize before
    // any collators are executed, which may attempt requests against the API.
    initialDelay: Duration.fromObject({ seconds: 3 }),
  });

  // Announcements indexing
  indexBuilder.addCollator({
    schedule: tenMinutesSchedule,
    factory: AnnouncementCollatorFactory.fromConfig({
      logger: env.logger,
      discoveryApi: env.discovery,
    }),
  });

  // …

  // The scheduler controls when documents are gathered from collators and sent
  // to the search engine for indexing.
  const { scheduler } = await indexBuilder.build();

  // A 3 second delay gives the backend server a chance to initialize before
  // any collators are executed, which may attempt requests against the API.
  setTimeout(() => scheduler.start(), 3000);
  useHotCleanup(module, () => scheduler.stop());

  return await createRouter({
    engine: indexBuilder.getSearchEngine(),
    types: indexBuilder.getDocumentTypes(),
    permissions,
    config,
    logger,
  });
}
```

Nicely display announcements search results:

```typescript
// packages/app/src/components/search/SearchPage.tsx

import { AnnouncementSearchResultListItem } from '@backstage-community/plugin-announcements';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';

// ...
<SearchType.Accordion
  name="Result Type"
  defaultValue="software-catalog"
  types={[
    // ...
    {
      value: 'announcements',
      name: 'Announcements',
      icon: <RecordVoiceOverIcon />,
    },
  ]}
/>

<SearchResult>
  // ...
  <AnnouncementSearchResultListItem />
</SearchResult>
```
