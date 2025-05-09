# Azure DevOps Backend

Simple plugin that proxies requests to the [Azure DevOps](https://docs.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-6.1) API.

## Setup

The following sections will help you get the Azure DevOps Backend plugin setup and running.

### Credentials

In order to support **Multiple Organizations** as well as **Service Principals** and **Managed Identity** the Azure DevOps plugin relies on the `integrations.azure` section of your `app-config.yaml` being properly configured to be able to access the needed credentials. More details on this can be found in the [Azure DevOps Locations](https://backstage.io/docs/integrations/azure/locations) documentation.

### Single Organization Configuration

For those with a single organization the Azure DevOps plugin requires the following YAML configuration to be added to your `app-config.yaml`:

```yaml
azureDevOps:
  host: dev.azure.com
  organization: my-company
```

Configuration Details:

- `host` can be the same as the ones used for the `integration` section
- `organization` is your Azure DevOps Services (cloud) Organization name or for Azure DevOps Server (on-premise) this will be your Collection name

> Note: The credentials in this setup would still need to be defined in your `integrations.azure` section of your `app-config.yaml` as noted in the [Credentials](#credentials) section above.

### Up and Running

Here's how to get the backend up and running:

1. First we need to add the `@backstage-community/plugin-azure-devops-backend` package to your backend:

   ```sh
   yarn --cwd packages/backend add @backstage-community/plugin-azure-devops-backend
   ```

2. Then in your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-azure-devops-backend'));

  backend.start();
```

## Links

- [Frontend part of the plugin](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/azure-devops)
- [The Backstage homepage](https://backstage.io)
