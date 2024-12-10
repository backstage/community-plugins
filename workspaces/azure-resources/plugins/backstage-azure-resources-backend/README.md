# Azure resources backend plugin

The backend API plugin used by the frontend plugin. This plugin wraps a few Azure Resource Graph queries to pull information about your Azure resource in relation to a backstage entity.

## Getting started

Add following to your backstage instance

```
# From the Backstage root directory
cd packages/backend
yarn add @backstage-community/plugin-azure-resources-backend
```

```TypeScript
/// ./packages/backend/src/plugins/azure-resources-backend.ts
import { createRouter } from '@backstage-community/plugin-azure-resources-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

```TypeScript
/// ./packages/backend/src/index.ts

import azureResourcesBackend from './plugins/azure-resources-backend';
const azureResourcesBackendEnv = useHotMemoize(module, () => createEnv('azure-resources-backend'));
apiRouter.use('/azure-resources', await azureResourcesBackend(azureResourcesBackendEnv));
```

## Authentication with Azure

In order for this plugin to work, you'll need an identity with `read` access at the scope you pull information from.  
Depending on where your backstage instance is running, there are a few ways to authenticate. The plugin uses `@azure/identity` which supports `managed identities` and `application registration`

### Using managed identity

In case your backstage instance runs on an Azure resource type that supports system assigned managed identity (MSI), the only thing you need to do is assign the `service principal` with read permission on the `resource group`, `subscription(s)` or `management group`, depending on your environment.

### Using app registration

Create a [new Application Registration](https://docs.microsoft.com/azure/active-directory/develop/quickstart-register-app?WT.mc_id=AZ-MVP-5003437), and assign the SPN appropriate permissions. Then add the following to your `app-config.yaml` and/or `app-config.local.yaml`. If using MSI you do not add this configuration.

```yaml
azureResources:
  clientId: ab77a497-102e-4c4d-9853-3aca7e733245 # the app registrations clientId
  clientSecret: ~AcbyiAM2YUMQwUSqhzg # a secret created for the app registration
  tenantId: f02ae3d3-be5c-4b9d-9d6e-8192055d4083 # your Azure tenant id
```
