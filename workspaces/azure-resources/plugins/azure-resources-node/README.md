# @backstage-community/plugin-azure-resources-node

## Overview

This library provide an azure resource graph service wrap that uses credentials from config and can be used to fetch resources from Azure.

## Installation

Add the dependency to any plugins that would like to use this service.

```bash
yarn add @backstage-community/plugin-azure-resources-node
```

## Configuration

the following configuration is required to use this service:

```yaml
azure-resources:
  tenantId: <tenantId>
  clientId: <clientId>
  clientSecret: <clientSecret>
```

if no configuration is provided, the service will try to use the default azure credentials. see [here](https://docs.microsoft.com/en-us/azure/developer/javascript/sdk/how-to/azure-identity-default-credentials?tabs=javascript) for more information.

## Usage

```typescript
import { azureResourcesServiceRef } from '@internal/backstage-plugin-azure-resources-node';

// Add it as dependency on your plugin or module
deps: {
  logger: coreServices.logger,
  azureResourcesService: azureResourcesServiceRef,
},
//...

```

_This plugin was created through the Backstage CLI_
