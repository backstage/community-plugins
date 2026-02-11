# Azure Storage Explorer Backend

Welcome to the `Azure Storage backend` plugin!

## Getting started

### Installation

This plugin needs to be added to an existing backstage instance.

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @backstage-community/plugin-azure-storage-explorer-backend
```

### New Backend System

The Azure Storage Explorer backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-azure-storage-explorer-backend'));

  backend.start();
```

### Legacy Backend System

Create a file called `azure-storage.ts` inside `packages/backend/src/plugins/` and add the following

#### azure-storage.ts

```typescript
import { createRouter } from 'backstage-plugin-azure-storage-backend';
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

And import the plugin to `packages/backend/src/index.ts`.

```diff
diff --git a/packages/backend/src/index.ts b/packages/backend/src/index.ts
index c4736a5..5822302 100644
--- a/packages/backend/src/index.ts
+++ b/packages/backend/src/index.ts
@@ -28,6 +28,7 @@ import scaffolder from './plugins/scaffolder';
 import proxy from './plugins/proxy';
 import techdocs from './plugins/techdocs';
 import search from './plugins/search';
+import azurestorage from './plugins/azure-storage';
 import { PluginEnvironment } from './types';
 import { ServerPermissionClient } from '@backstage/plugin-permission-node';
 import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
@@ -85,6 +86,7 @@ async function main() {
   const techdocsEnv = useHotMemoize(module, () => createEnv('techdocs'));
   const searchEnv = useHotMemoize(module, () => createEnv('search'));
   const appEnv = useHotMemoize(module, () => createEnv('app'));
+  const azureStorageEnv = useHotMemoize(module, () => createEnv('azurestorage'));

   const apiRouter = Router();
   apiRouter.use('/catalog', await catalog(catalogEnv));
@@ -93,6 +95,7 @@ async function main() {
   apiRouter.use('/techdocs', await techdocs(techdocsEnv));
   apiRouter.use('/proxy', await proxy(proxyEnv));
   apiRouter.use('/search', await search(searchEnv));
+  apiRouter.use('/azure-storage', await azurestorage(azureStorageEnv));

   // Add backends ABOVE this line; this 404 handler is the catch-all fallback
   apiRouter.use(notFoundHandler());

```

## Configuration

The plugin supports two configuration formats:

### OSS Integration Format (Recommended)

Use the standard Backstage integration format (see [Azure Blob Storage Integration docs](https://backstage.io/docs/integrations/azure-blobStorage/locations/)):

```yaml
integrations:
  azureBlobStorage:
    - accountName: ${AZURE_ACCOUNT_NAME}
      accountKey: ${AZURE_ACCOUNT_KEY} # Account key authentication
      allowedContainers: ['container1', 'container2'] # Optional: filter containers
    - accountName: ${AZURE_ACCOUNT_NAME_2}
      sasToken: ${AZURE_SAS_TOKEN} # SAS token authentication
    - accountName: ${AZURE_ACCOUNT_NAME_3}
      connectionString: ${AZURE_CONNECTION_STRING} # Connection string authentication
    - accountName: ${AZURE_ACCOUNT_NAME_4}
      aadCredential: # Azure AD authentication
        tenantId: ${AZURE_TENANT_ID}
        clientId: ${AZURE_CLIENT_ID}
        clientSecret: ${AZURE_CLIENT_SECRET}
      allowedContainers: ['secure-container'] # Optional: filter containers
```

### Legacy Format (Deprecated)

The legacy custom format is still supported for backward compatibility:

```yaml
azureStorage:
  blobContainers:
    - accountName: 'storageAccount'
      allowedContainers: ['container1', 'container2'] # Optional: filter containers
      authType: accessToken
      auth:
        accessToken: 'STORAGE ACCOUNT ACCESS TOKEN'
    - accountName: 'anotherStorageAccount'
      authType: clientToken
      auth:
        tenantId: 'AZURE TENANT ID'
        clientId: 'AZURE CLIENT ID'
        clientSecret: 'AZURE CLIENT SECRET'
```

**Note:** If both formats are present, the legacy format takes precedence.

## Authenticating Storage Account

This plugin supports multiple authentication methods:

### Account Key (OSS: `accountKey`, Legacy: `accessToken`)

Azure storage account access keys provide full access to the storage account. [More Info...](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)

### SAS Token (OSS only: `sasToken`)

Shared Access Signature tokens provide delegated access with specific permissions. [More Info...](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

### Connection String (OSS only: `connectionString`)

Full connection string including credentials and endpoint information.

### Azure AD Credentials (OSS: `aadCredential`, Legacy: `clientToken`)

RBAC authentication using Azure App Client credentials. [More Info...](https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access)

## Filtering Containers

Use the `allowedContainers` field to restrict which containers are accessible through the plugin. This is useful for security and to limit the scope of exposed data.
