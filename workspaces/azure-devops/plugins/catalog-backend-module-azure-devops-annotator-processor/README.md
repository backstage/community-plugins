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
