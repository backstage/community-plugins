# @backstage-community/plugin-search-backend-module-announcements

The announcements backend module for the search plugin.

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

## Previously maintained by

- [procore-oss](https://github.com/procore-oss/backstage-plugin-announcements/tree/main/plugins/search-backend-module-announcements)
- [K-Phoen](https://github.com/K-Phoen/backstage-plugin-announcements/tree/main/plugins/announcements-backend/src/search)
