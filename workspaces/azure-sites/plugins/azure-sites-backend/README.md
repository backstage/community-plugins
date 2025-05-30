# Azure Sites Backend

Simple plugin that proxies requests to the Azure Portal API through Azure SDK JavaScript libraries.

_Inspired by [roadie.io AWS Lambda plugin](https://roadie.io/backstage/plugins/aws-lambda/)_

## Setup

The following sections will help you get the Azure Sites Backend plugin setup and running.

### Configuration

The Azure plugin requires the following YAML to be added to your app-config.yaml:

```yaml
azureSites:
  domain:
  tenantId:
  clientId:
  clientSecret:
  allowedSubscriptions:
    - id:
```

Configuration Details:

- `domain` can be found by visiting the [Directories + Subscriptions settings page](https://portal.azure.com/#settings/directory). Alternatively you can inspect the [Azure home](https://portal.azure.com/#home) URL - `https://portal.azure.com/#@<Your_Domain>/`.
- `tenantId` can be found by visiting [Azure Directory Overview page](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade).
- (Optional) `clientId` and `clientSecret` can be the same values you used for [Azure DevOps Backend](https://github.com/backstage/community-plugins/tree/main/workspaces/azure-devops/plugins/azure-devops-backend) or [Azure Integration](https://backstage.io/docs/integrations/azure/org#app-registration) as long as this App Registration has permissions to read your function apps.
- (Optional) `allowedSubscriptions` is an array of `id` that will be used to iterate over and look for the specified functions' app. `id` can be found the [Subscriptions page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade).

### Integrating

Here's how to get the backend plugin up and running:

#### New Backend System

The Azure Sites backend plugin has support for the [new backend system](https://backstage.io/docs/backend-system/), here's how you can set that up:

In your `packages/backend/src/index.ts` make the following changes:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-azure-sites-backend'));

  // ...

  backend.start();
```

#### Start Backed & Test

1. Now run `yarn start-backend` from the repo root.

2. Finally, open `http://localhost:7007/api/azure/health` in a browser, it should return `{"status":"ok"}`.
