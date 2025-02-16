# Amplication custom action for Scaffolder Backstage

The Amplication module for [@backstage/plugin-scaffolder-backend](https://www.npmjs.com/package/@backstage/plugin-scaffolder-backend).

This module allows users automate code generation using predefined templates, ensuring standardization for resource creation.

## Installation

## Configuration

Configure your `app-config.yaml` with Amplication's configuration

```yaml title="app-config.yaml"
amplication:
  appUrl: https://app.amplication.com
  apiUrl: https://server.amplication.com/graphql
  token: ${AMPLICATION_TOKEN}
```

### Available custom actions

| Action                    |                    Description                     |
| ------------------------- | :------------------------------------------------: |
| `amplication:new-service` | Allows you to creates a new service in Amplication |

To begin, install the module package into the backend workspace of your backstage instance:

```console
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-amplication
```

### Registering the annotator action plugin with the backend system

To install the module into the [backend system](https://backstage.io/docs/backend-system/), add the following into the `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts
const backend = createBackend();

// highlight-add-start
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-amplication'),
);
// highlight-add-end

backend.start();
```

## Adding the Amplication template.yaml

Import this catalog entity through the locations section in the `catalog-info.yaml` file:

```yaml
# catalog-info.yaml
catalog:
  locations:
    - type: url
      target: https://github.com/backstage/community-plugins/blob/main/workspaces/amplication/plugins/scaffolder-backend-module-amplication/src/template/template.yaml
      rules:
        - allow: [System, Component]
```

Alternatively, you can manually add the catalog entity which is located in the [plugin directory](./src/template/template.yaml).

## Discover new services

If you're creating a new service with the right plugin installed, it will be created with a `catalog-info.yaml` file in the root of the service. With the following configuration, you could auto-discover the service and add it to your catalog:

```yaml
catalog:
  providers:
    github:
    providerId:
      organization: <YOUR_GITHUB_ORGANIZATION>
      catalogPath: '**/catalog-info.yaml'
      filters:
      repository: '.*'
```
