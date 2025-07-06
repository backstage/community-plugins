# Azure DevOps Actions backend module for the Scaffolder plugin

This is a [Backend Plugin](https://backstage.io/docs/plugins/backend-plugin/) containing a set of [Custom Actions](https://backstage.io/docs/features/software-templates/writing-custom-actions) using the Azure Devops [`REST API`](https://learn.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-7.2) & [azure-devops-node-api](https://github.com/microsoft/azure-devops-node-api).
It contains the following actions:

- `azure:pipeline:run`: run a azure pipeline for a project, with pipeline id

## Installation

From your Backstage instance root folder:

```shell
yarn --cwd packages/backend add @backstage-community/plugin-scaffolder-backend-module-azure-devops
```

## Configuration

### Code

Import the module by modifying the `packages/backend/src/index.ts` file on your Backstage instance:

```ts
// packages/backend/src/index.ts

backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-azure-devops'),
);
```

### Pre-Requisites

Your Backstage instance must have a valid [Azure DevOps integration](https://backstage.io/docs/integrations/azure/locations) for for your target host. `dev.azure.com` is used by default in the scaffolder actions.

To get started quickly, use the following as an example:

```yaml
integrations:
  azure:
    - host: dev.azure.com
      credentials:
        - personalAccessToken: ${PERSONAL_ACCESS_TOKEN}
```

## Usage

You can use the action in any of the steps of your [Software Template](https://backstage.io/docs/features/software-templates/).
See [here](../../examples/scaffolder.yaml) for an example of a Software Template making use of the Azure Run Action.

### Example with the `azure:pipeline:run` action

```yaml
spec:
  parameters:
    - title: Choose a location
      required:
        - repoUrl
        - pipelineId
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - dev.azure.com
        pipelineId:
          title: Pipeline Id
          type: string
          description: The Id for the pipeline you want to execute
  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        organization: ${{ (parameters.repoUrl | parseRepoUrl)['organization'] }}
        pipelineId: ${{ parameters.pipelineId }}
        project: ${{ (parameters.repoUrl | parseRepoUrl)['project'] }}

  output:
    links:
      - title: Open in DevOps
        icon: catalog
        url: ${{ steps['runAzurePipeline'].output.pipelineRunUrl }}
```

### Example Run Azure Pipeline on alternative host to dev.azure.com

```yaml
spec:
  #[...]
  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        #[...]
        host: 'AZURE_DEVOPS_HOST'
```

### Example using the User Token using `azure:pipeline:run` action

```yaml
spec:
  parameters:
    #[...]
    properties:
      repoUrl:
        ui:field: RepoUrlPicker
        ui:options:
          #[...]
          requestUserCredentials:
            secretsKey: USER_OAUTH_TOKEN
            additionalScopes:
              azure: []
      pipelineId:
        title: Pipeline Id
        type: string
        description: The Id for the pipeline you want to execute

  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        #[...]
        pipelineId: ${{ parameters.pipelineId }}
        token: ${{ secrets.USER_OAUTH_TOKEN }}
```

### Example running a pipeline on a branch using the `azure:pipeline:run` action

```yaml
spec:
  parameters:
    #[...]
    properties:
      #[...]
      branch:
        title: branch
        type: string
        description: The branch for the pipeline you want to execute

  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        #[...]
        branch: ${{ parameters.branch }}
```

### Example running a pipeline with template parameters using the `azure:pipeline:run` action

```yaml
spec:
  parameters:
    #[...]
    properties:
      #[...]
      templateParameters:
        type: object
        title: Template Parameters
        description: Azure DevOps pipeline template parameters in key-value pairs.

  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        #[...]
        templateParameters:
          projectRepo: ${{ (parameters.repoUrl | parseRepoUrl)['repo'] }}
          sampleTemplateParameterKey: sampleTemplateParameterValue
```

### Example running a pipeline, waiting for it to complete, and printing the output using the `azure:pipeline:run` action

```yaml
spec:
  steps:
    - id: runAzurePipeline
      name: Run Pipeline
      action: azure:pipeline:run
      input:
        #[...]
        pollingInterval: 10 # Poll for pipeline run status every 10 second
        pipelineTimeout: 300 # Timeout after 5 minutes
  output:
    text:
      - title: Pipeline run info
        content: |
          **pipelineRunStatus:** `${{ steps['runAzurePipeline'].output.pipelineRunStatus }}` }}
          **pipelineRunId:** `${{ steps['runAzurePipeline'].output.pipelineRunId }}` }}
          **pipeline output:** `${{ steps['runAzurePipeline'].output.pipelineOutput['myOutputVar'].value }}` }}
```
