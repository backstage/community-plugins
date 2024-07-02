# Azure DevOps Annotator Processor backend module for the Catalog plugin

## Overview

This processor will add the needed annotations to your entities automatically for you. This means you don't have to manually add these annotations making using the Azure DevOps plugin much easier.

## Annotations Added

The Azure DevOps Annotator Processor will add the following annotations:

- `dev.azure.com/host-org`
- `dev.azure.com/project-repo`

If one or both of these exist then the existing value will be kept as is.

## Setup

To setup the Azure DevOps Annotator Processor you'll need to first run this command to add the package:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor
```

Then in your `/packages/backend/src/index.ts` file you simply add the following line:

```diff
   import { createBackend } from '@backstage/backend-defaults';

   const backend = createBackend();

   // ... other feature additions

+  backend.add(import('@backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor'));

   backend.start();
```

### Legacy Setup

To setup the Azure DevOps Annotator Processor when using the legacy backend you'll first need to run this command to add the package:

```sh
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-catalog-backend-module-azure-devops-annotator-processor
```

Then you will need to make the following changes in your `/packages/backend/src/plugins/catalog.ts` file:

```diff
  import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
  import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
  import { Router } from 'express';
  import { PluginEnvironment } from '../types';
+ import { AzureDevOpsAnnotatorProcessor } from '@backstage-community/plugin-azure-devops-backend';

  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    const builder = await CatalogBuilder.create(env);
    builder.addProcessor(new ScaffolderEntitiesProcessor());
+   builder.addProcessor(AzureDevOpsAnnotatorProcessor.fromConfig(env.config));
    const { processingEngine, router } = await builder.build();
    await processingEngine.start();
    return router;
  }
```
