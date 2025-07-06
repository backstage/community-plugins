# Integration with `@backstage/plugin-search`

## Installation

Add the module to your backend app:

```bash
yarn add --cwd packages/backend @backstage-community/plugin-search-backend-module-announcements
```

Update `packages/backend/src/index.ts` to import the announcements search module and register it with the backend:

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
