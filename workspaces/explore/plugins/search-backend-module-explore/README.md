# search-backend-module-explore

This package exports a module that extends the search backend to also indexing the tools exposed by the [`explore` service](https://github.com/backstage/community-plugins/tree/main/workspaces/explore/plugins/explore-backend).

## Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-search-backend-module-explore
```

Add the collator to your backend instance, along with the search plugin itself:

```tsx
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend'));
backend.add(
  import('@backstage-community/plugin-search-backend-module-explore'),
);
backend.start();
```

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `search.collators.explore` key. See [the config definition file](https://github.com/backstage/community-plugins/blob/main/workspaces/explore/plugins/search-backend-module-explore/config.d.ts) for more details.
