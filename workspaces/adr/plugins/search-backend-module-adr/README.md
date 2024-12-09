# backstage-plugin-search-backend-module-adr

The adr backend module for the search plugin.

This package exports a module that extends the search backend to also indexing the ADRs exposed by the [`adr` service](https://github.com/backstage/community-plugins/tree/main/workspaces/adr/plugins/adr-backend)

## Installation

Add the module package as a dependency:

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/search-backend-module-adr
```

Add the collator to your backend instance, along with the search plugin itself:

```tsx
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage-community/search-backend-module-adr'));
backend.start();
```

You may also want to add configuration parameters to your app-config, for example for controlling the scheduled indexing interval. These parameters should be placed under the `search.collators.adr` key. See [the config definition file](https://github.com/backstage/backstage/blob/master/plugins/search-backend-module-adr/config.d.ts) for more details.

## Parsing custom ADR document formats

By default, the `DefaultAdrCollatorFactory` will parse and index documents that follow [MADR v3.0.0](https://github.com/adr/madr/tree/3.0.0) and [MADR v2.x](https://github.com/adr/madr/tree/2.1.2) standard file name and template format. If you use a different ADR format and file name convention, you can configure `DefaultAdrCollatorFactory` with custom `adrFilePathFilterFn` and `parser` options (see type definitions for details):

```ts
DefaultAdrCollatorFactory.fromConfig({
  ...
  parser: myCustomAdrParser,
  adrFilePathFilterFn: myCustomAdrFilePathFilter,
  ...
})
```

If you're using the new backend system, consider using the `adrsCollatorExtensionPoint`. which can be extended to set a custom `parser` and/or `adrFilePathFilterFn`.
