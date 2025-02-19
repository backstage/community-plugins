# Amplication actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [Amplication](https://amplication.com/).

The following actions are currently supported in this module:

- Scaffold a new service

## Setup

You need to setup the [Amplication catalog backend plugin](../catalog-backend-module-amplication/README.md) before you move forward with any of the following steps if you haven't already.

## Installation

Run the following command to install the action package in your Backstage project

```bash
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-amplication
```

### Installing the action on the backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-amplication'),
);

backend.start();
```

## Configuration

Configure your `app-config.yaml` with Amplication's configuration

```yaml title="app-config.yaml"
amplication:
  appUrl: https://app.amplication.com
  apiUrl: https://server.amplication.com/graphql
  token: ${AMPLICATION_TOKEN}
```

Add the Amplication actions to your templates, see the [example](./src/template/template.yaml) file in this repository for complete usage examples

```yaml
id: scaffoldService
name: Scaffold a New Service
action: amplication:scaffold-service
input:
  name: fooService
  description: fooService description
  project_id: 1a2b3c4d5e6f7g8h9i0j
  serviceTemplate_id: 9i8h7g6f5e4d3c2b1a0
  workspace_id: f1e2d3c4b5a6978685d4
```

## Usage

### Action: amplication:scaffold-service

#### Input

| Parameter Name     |  Type  | Required | Description         | Example              |
| ------------------ | :----: | :------: | ------------------- | -------------------- |
| name               | string |   Yes    | Service name        | foo                  |
| description        | string |    No    | Service description | foo description      |
| project_id         | string |   Yes    | Project ID          | 1a2b3c4d5e6f7g8h9i0j |
| serviceTemplate_id | string |   Yes    | Service Template ID | 9i8h7g6f5e4d3c2b1a0  |
| workspace_id       | string |   Yes    | Workspace ID        | f1e2d3c4b5a6978685d4 |

#### Output

This action doesn't have any outputs.

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
