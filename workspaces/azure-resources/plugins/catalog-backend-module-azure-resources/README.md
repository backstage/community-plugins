# Azure Resources Backend Module for Backstage Catalog

The Azure Resources backend module integrates Azure Resource Graph into Backstage's catalog.

## Capabilities

The Azure Resources catalog backend module has the following capabilities:

- **Custom Resource Ingestion**: Ingest Azure resources into the Backstage catalog using custom Kusto Query Language (KQL) queries
- **Flexible Scoping**: Query resources across specific management groups or subscriptions
- **Field Mapping**: Customize how Azure resource properties map to Backstage entity fields
- **Scheduled Synchronization**: Automatically refresh resources on a configurable schedule
- **Default Owner Assignment**: Assign default owners to entities when no owner information is found

## Installation

Install the catalog backend module in your Backstage project:

```bash
yarn workspace backend add @backstage-community/plugin-catalog-backend-module-azure-resources
```

## Configuration

### Prerequisites

This module requires the `@backstage-community/plugin-azure-resources-node` package to access the Azure Resource Graph API. See the [azure-resources-node README](../azure-resources-node/README.md) for authentication configuration details.

### Backend Setup

Register the module in your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

/* highlight-add-next-line */
backend.add(
  import('@backstage-community/plugin-catalog-backend-module-azure-resources'),
);

backend.start();
```

### Provider Configuration

Configure one or more Azure Resources providers in your `app-config.yaml`:

```yaml title="app-config.yaml"
catalog:
  providers:
    azureResources:
      - id: production-storage-accounts
        query: |
          Resources
          | where type =~ 'microsoft.storage/storageaccounts'
          | where location in ('eastus', 'westus2')
        scope:
          subscriptions:
            - ${AZURE_SUBSCRIPTION_ID}
        schedule:
          frequency: { hours: 5 }
          timeout: { minutes: 10 }
        defaultOwner: 'team-platform'
        maxPages: 150 # Allow up to 150,000 resources

      - id: production-databases
        query: |
          Resources
          | where type =~ 'microsoft.sql/servers/databases'
          | where tags['environment'] == 'production'
        scope:
          managementGroups:
            - mg-production
        schedule:
          frequency: { hours: 2 }
          timeout: { minutes: 5 }
        mapping:
          metadata:
            annotations:
              environment: tags.environment
              cost-center: tags['cost-center']
          spec:
            owner: tags['catalog.owner']
```

### Configuration Parameters

The following table describes the configuration parameters for each provider under `catalog.providers.azureResources`:

| Name           | Description                                                                                                                                                                                  | Default Value                                           | Required |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------- |
| `id`           | Unique identifier for the provider. Used in entity location keys.                                                                                                                            | -                                                       | Yes      |
| `query`        | Azure Resource Graph KQL query to fetch resources. See [Azure Resource Graph query examples](https://learn.microsoft.com/en-us/azure/governance/resource-graph/).                            | -                                                       | Yes      |
| `scope`        | Scope configuration specifying which management groups or subscriptions to query.                                                                                                            | -                                                       | Yes      |
| `schedule`     | Schedule configuration for refresh tasks. Supports cron, ISO duration, or human duration formats.                                                                                            | `{ frequency: { hours: 5 }, timeout: { minutes: 10 } }` | No       |
| `mapping`      | Custom mapping configuration to map Azure resource properties to Backstage entity fields. Supports dot notation for nested properties.                                                       | Default mapping (see below)                             | No       |
| `defaultOwner` | Default owner to assign to entities when no owner information is found in the Azure resource.                                                                                                | -                                                       | No       |
| `maxPages`     | Maximum number of pages to fetch from Azure Resource Graph to prevent infinite loops. With a default page size of 1000, this controls the maximum number of resources that can be retrieved. | `100` (allowing up to 100,000 resources)                | No       |

#### Scope Configuration

At least one of the following must be specified:

- `scope.managementGroups`: Array of management group IDs to query
- `scope.subscriptions`: Array of subscription IDs to query

#### Default Mapping

By default, Azure resources are mapped to Backstage `Resource` entities with the following properties:

- **metadata.name**: Derived from the Azure resource name (sanitized to be Backstage-compliant)
- **metadata.title**: Azure resource name
- **metadata.annotations**:
  - `backstage.io/view-url`: Link to Azure Portal
  - `backstage.io/edit-url`: Link to Azure Portal
  - `management.azure.com/resourceId`: Azure resource ID
  - `management.azure.com/subscriptionId`: Azure subscription ID
  - `management.azure.com/location`: Azure region/location
- **spec.type**: Azure resource type
- **spec.owner**: Extracted from `tags['catalog.owner']` or falls back to `defaultOwner`

#### Custom Mapping

You can customize how Azure resource properties map to entity fields using the `mapping` configuration:

```yaml
mapping:
  metadata:
    description: properties.description # Map Azure resource description
    annotations:
      my-annotation: tags.myAnnotation # Maps tags.myAnnotation to metadata.annotations.my-annotation
      cost-center: tags['cost-center'] # Bracket notation for tags with special characters
  spec:
    owner: tags['catalog.owner'] # Override the default owner extraction
```

The mapping supports:

- **Dot notation**: Access nested properties (e.g., `tags.environment`)
- **Bracket notation**: Access properties with special characters (e.g., `tags['cost-center']`)
- **Deep nesting**: Map any nested structure from Azure resources

## Links

- [Azure Resource Graph Documentation](https://learn.microsoft.com/en-us/azure/governance/resource-graph/)
- [KQL Query Language Reference](https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/)
- [Azure Identity DefaultAzureCredential](https://docs.microsoft.com/en-us/azure/developer/javascript/sdk/how-to/azure-identity-default-credentials?tabs=javascript)
