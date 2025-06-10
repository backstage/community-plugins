# Dotnet Actions backend module for the Scaffolder plugin

This is a [Backend Plugin](https://backstage.io/docs/plugins/backend-plugin/) containing a set of [Custom Actions](https://backstage.io/docs/features/software-templates/writing-custom-actions) using the [`dotnet cli`](https://learn.microsoft.com/en-us/dotnet/core/tools/)

It contains the following actions:

- `dotnet:new`: create a new dotnet project

## Installation

From your Backstage instance root folder:

```shell
yarn --cwd packages/backend add @backstage-community/plugin-scaffolder-backend-module-dotnet
```

## Configuration

### Code

Import the module by modifying the `packages/backend/src/index.ts` file on your Backstage instance:

```ts
// packages/backend/src/index.ts

backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-dotnet'),
);
```

## Usage

You can use the action in any of the steps of your [Software Template](https://backstage.io/docs/features/software-templates/).
See [here](../../examples/scaffolder/scaffolder.yaml) for an example of a Software Template making use of the Dotnet New.

### Example with the `dotnet:new` action

```yaml
spec:
  parameters:
    - title: Choose your project
      required:
        - project
        - component_id
      properties:
        component_id:
          title: Name
          type: string
          description: Unique name of your service. The name must contain only Alphabet characters (e.g MyPlugin)
          maxLength: 20
          pattern: '^[A-Za-z]+$'
        project:
          title: Project
          type: string
          description: Choose what dotnet project to create
          default: None
          enum:
            - webapi
            - aspire
            - webapp
  # These steps are executed in the scaffolder backend, using data that we gathered
  # via the parameters above.
  steps:
    - id: runAzurePipeline
      name: Create New Project
      action: dotnet:new
      input:
        template: ${{parameters.project}}
        args:
          - -n
          - ${{parameters.component_id | replace("-", "_")}}
```
