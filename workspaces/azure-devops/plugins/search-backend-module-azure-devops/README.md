# @backstage-community/plugin-search-backend-module-azure-devops

This plugin provides the pieces necessary to have Backstage index articles and entries from a wiki in an Azure DevOps project to make them available to search with the Backstage Search feature.

## Prerequisites

- You must have an Azure DevOps project with a wiki present
- You must be using the Backstage Search feature
- You must be using the new backend system in Backstage

## Getting started

In the root directory of your Backstage project:

```bash
yarn add --cwd packages/backend @backstage-community/plugin-search-backend-module-azure-devops
```

### Authentication

This plugin supports all credential types provided by `DefaultAzureDevOpsCredentialsProvider` from `@backstage/integration`, including:

- **Personal Access Tokens (PATs)**
- **Service Principals (client credentials)**
- **Managed Identities**

Credentials are configured under `integrations.azure` in your `app-config.yaml`. This is the same configuration used by other Azure DevOps plugins in the Backstage ecosystem.

```yaml
# app-config.yaml

integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - personalAccessToken: ${AZURE_TOKEN}
```

For service principal or managed identity configuration, see the [Backstage Azure integration documentation](https://backstage.io/docs/integrations/azure/locations).

### Collator configuration

Add the wiki collator configuration to your `app-config.yaml`:

```yaml
# app-config.yaml

search:
  collators:
    azureDevOpsWikiCollator:
      # baseUrl is optional, defaults to https://dev.azure.com
      # Only needed for Azure DevOps Server (on-premises) instances
      # baseUrl: https://ado.mycompany.com
      wikis:
        - wikiIdentifier: Wiki-Identifier.wiki # The identifier of the wiki found in the ADO URL. Required.
          organization: MyOrganization # The name of the organization the wiki is in. Required.
          project: MyProject # The name of the project the wiki is in. Required.
          titleSuffix: ' - My Suffix' # A string to append to article titles in search results. Optional.
        - wikiIdentifier: Wiki-Identifier2.wiki
          organization: MyOrganization
          project: MyProject
          titleSuffix: ' - Suffix 2'
```

Add the plugin to your backend:

```diff
  import { createBackend } from '@backstage/backend-defaults';

  const backend = createBackend();

  // ... other feature additions

+ backend.add(import('@backstage-community/plugin-search-backend-module-azure-devops'));

  backend.start();
```

From here, the collator will begin indexing all articles in the wiki into search. Once the indexing is done, the articles and their content will be searchable via the Backstage search feature.

If there are any errors with indexing the articles, they will be reported in the Backstage logs.

### Deprecated: Direct token configuration

The previous configuration style using a `token` field directly in the collator config is deprecated and will be removed in a future release. If you are currently using this configuration:

```yaml
# app-config.yaml — DEPRECATED

search:
  collators:
    azureDevOpsWikiCollator:
      baseUrl: https://dev.azure.com
      token: ${AZURE_TOKEN} # Deprecated — use integrations.azure instead
      wikis:
        - wikiIdentifier: Wiki-Identifier.wiki
          organization: MyOrganization
          project: MyProject
```

Please migrate to the `integrations.azure` configuration shown above. The `token` field still works for backward compatibility, but you will see a deprecation warning in your logs.

> **Note:** Microsoft is [retiring Global PATs in Azure DevOps Services on December 1, 2026](https://devblogs.microsoft.com/devops/retirement-of-global-personal-access-tokens-in-azure-devops/). If you are using a Global PAT, you should migrate to organization-scoped PATs or Entra ID credentials (service principal or managed identity) before that date.

## Previously maintained by

- [arhill05](https://github.com/arhill05/backstage-plugin-search-backend-module-azure-devops-wiki/blob/main/README.md)
