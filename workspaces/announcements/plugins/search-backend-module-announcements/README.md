# @backstage-community/plugin-search-backend-module-announcements

The announcements backend module for the `@backstage/plugin-search` plugin.

![Announcements search results](./images/announcements_search.png)

## Installation

Add the module to your backend package.

```bash
yarn add --cwd packages/backend @backstage-community/plugin-search-backend-module-announcements
```

Update `packages/backend/src/index.ts` to import the announcements search module and register it with the backend.

```ts
// ...
const backend = createBackend();

// ...

backend.add(import('@backstage-community/plugin-announcements-backend'));
backend.add(
  import('@backstage-community/plugin-search-backend-module-announcements'),
);
// ...
```

## Adding search support to the frontend

Add the announcement search result list item to your search results.

```tsx
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

## Previously maintained by

- [procore-oss](https://github.com/procore-oss/backstage-plugin-announcements/tree/main/plugins/search-backend-module-announcements)
- [K-Phoen](https://github.com/K-Phoen/backstage-plugin-announcements/tree/main/plugins/announcements-backend/src/search)
