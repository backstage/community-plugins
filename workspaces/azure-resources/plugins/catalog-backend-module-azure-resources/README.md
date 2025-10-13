# @backstage-community/plugin-catalog-backend-module-azure-resources

The azure-resources backend module for the catalog plugin.

This plugin provides a Backstage catalog entity provider that ingests Azure resources using Azure Resource Graph queries.

## Configuration

### Basic Configuration

```yaml
catalog:
  providers:
    azureResources:
      - id: my-azure-provider
        query: |
          Resources
          | where type =~ 'microsoft.storage/storageaccounts'
          | where location in ('eastus', 'westus2')
        scope:
          subscriptions:
            - 'subscription-id-1'
            - 'subscription-id-2'
        schedule:
          frequency: { hours: 5 }
          timeout: { minutes: 10 }
```

### Default Owner Configuration

You can configure a default owner for resources that don't have an owner tag. This is useful when Azure resources are missing the `backstage.io-owner` tag:

```yaml
catalog:
  providers:
    azureResources:
      - id: my-azure-provider
        query: |
          Resources
          | where type =~ 'microsoft.storage/storageaccounts'
        scope:
          subscriptions:
            - 'subscription-id-1'
        defaultOwner: 'team-platform'
```

**How it works:**

- If a resource has a `backstage.io-owner` tag, that value will be used as the owner
- If no `backstage.io-owner` tag exists and `defaultOwner` is configured, the default owner will be assigned
- If no `backstage.io-owner` tag exists and no `defaultOwner` is configured, the owner field will be undefined

### Custom Mapping

You can customize how Azure resource properties are mapped to Backstage entity fields:

```yaml
catalog:
  providers:
    azureResources:
      - id: my-azure-provider
        query: |
          Resources
          | where type =~ 'microsoft.web/sites'
        scope:
          subscriptions:
            - 'subscription-id-1'
        defaultOwner: 'team-platform'
        mapping:
          metadata:
            name: 'name'
            annotations:
              environment: 'tags.environment'
              app-name: "tags['app.kubernetes.io/name']"
          spec:
            owner: 'tags.owner' # This will override defaultOwner if present
            type: 'type'
```
