# Time Saver - Catalog processor

The Time Saver plugin provides an implementation of charts and statistics
related to your time savings that are coming from usage of your templates. This
catalog module translates granular Time Saver metadata stored on your template
definitions into the more coarse `backstage.io/time-saved` metadata annotation,
which may be leveraged by the Analytics API.

## Installation

1. Install the plugin package in your Backstage backend:

   ```sh
   # From your Backstage root directory
   yarn workspace packages/backend add @backstage-community/plugin-catalog-backend-module-time-saver-processor
   ```

2. Update your `packages/backend/src/index.ts` in the following way:

   ```diff
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();
   backend.add(import('@backstage/plugin-app-backend/alpha'));
   + backend.add(import('@backstage-community/plugin-catalog-backend-module-time-saver-processor'));
   // ...
   backend.start();
   ```
