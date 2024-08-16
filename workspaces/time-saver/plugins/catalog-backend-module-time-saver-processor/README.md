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

2. Wire up the processor in your backend.

   Add the `TimeSaverProcessor` to the catalog plugin in
   `packages/backend/src/catalog.ts`.

   ```diff
   + import {
   +   TimeSaverProcessor,
   + } from '@backstage-community/plugin-catalog-backend-module-time-saver-processor';
   import { Router } from 'express';
   import { PluginEnvironment } from '../types';

   export default async function createPlugin(
     env: PluginEnvironment,
   ): Promise<Router> {
     const builder = CatalogBuilder.create(env);
   + builder.addProcessor(new TimeSaverProcessor(logger));
     // ...
     return router;
   }
   ```

   **New Backend System**

   If you are using the New Backend System, you can instead do so by updating
   your `packages/backend/src/index.ts` in the following way:

   ```diff
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();
   backend.add(import('@backstage/plugin-app-backend/alpha'));
   + backend.add(import('@backstage-community/plugin-catalog-backend-module-time-saver-processor'));
   // ...
   backend.start();
   ```
