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

Add the necessary configuration for this plugin to your `app-config.yaml`:

```yaml
# app-config.yaml

# multiple wikis
azureDevOpsWikiCollator:
  baseUrl: https://my-azure-instance.com # The URL of your Azure DevOps instance. Required
  token: ${AZURE_TOKEN} # The PAT used to authenticate to the Azure DevOps REST API. Required.
  wikis:
    - wikiIdentifier: Wiki-Identifier.wiki # The identifier of the wiki. This can be found by looking at the URL of the wiki in ADO. It is typically something like '{nameOfWiki}.wiki'. Required.
      organization: MyOrganization # The name of the organization the wiki is contained in. Required.
      project: MyProject # The name of the project the wiki is contained in. Required.
      titleSuffix: ' - My Suffix' # A string to append to the title of articles to make them easier to identify as search results from the wiki. Optional
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

## Previously maintained by

- [arhill05](https://github.com/arhill05/backstage-plugin-search-backend-module-azure-devops-wiki/blob/main/README.md)
