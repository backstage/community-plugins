# Azure DevOps

This workspace contains plugins for integrating [Azure DevOps](https://dev.azure.com/) with Backstage, including build/PR dashboards, catalog entity annotation, scaffolder actions, and search indexing.

## Plugins

This workspace is composed of several packages:

- [azure-devops](./plugins/azure-devops/README.md) - The frontend plugin that displays Azure Pipelines builds, Azure Repos pull requests, git tags, and a pull request dashboard.
- [azure-devops-backend](./plugins/azure-devops-backend/README.md) - The backend plugin that proxies requests to the Azure DevOps REST API.
- [azure-devops-common](./plugins/azure-devops-common) - A common library containing types shared between the frontend and backend plugins.
- [catalog-backend-module-azure-devops-annotator-processor](./plugins/catalog-backend-module-azure-devops-annotator-processor/README.md) - A catalog backend module that automatically annotates entities with the Azure DevOps host and repo location, so they don't need to be added manually.
- [scaffolder-backend-module-azure-devops](./plugins/scaffolder-backend-module-azure-devops/README.md) - A scaffolder backend module providing custom actions to run/create/permit Azure Pipelines and to clone/push/create pull requests against Azure Repos.
- [scaffolder-backend-module-dotnet](./plugins/scaffolder-backend-module-dotnet/README.md) - A scaffolder backend module providing a `dotnet:new` custom action that wraps the [`dotnet` CLI](https://learn.microsoft.com/en-us/dotnet/core/tools/).
- [search-backend-module-azure-devops](./plugins/search-backend-module-azure-devops/README.md) - A search backend module that indexes articles from an Azure DevOps project wiki so they're available in Backstage Search.

## Quick start

You will find detailed installation and configuration instructions in each plugin's README file.

```sh
# From your Backstage root directory
# install backend
yarn --cwd packages/backend add @backstage-community/plugin-azure-devops-backend

# install frontend
yarn --cwd packages/app add @backstage-community/plugin-azure-devops

# see the READMEs in the frontend and backend plugin for configuration details,
# including how to set up the integrations.azure section of app-config.yaml
```

## About this workspace

Use these plugins to connect Backstage with Azure DevOps workflows: surfacing pipeline and pull request activity on entity pages, keeping catalog entities annotated with their Azure DevOps location, running Azure Pipelines and .NET project actions from Software Templates, and indexing Azure DevOps wikis for search.
