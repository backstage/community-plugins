# ArgoCD Actions for Backstage

Welcome to the ArgoCD actions module for `@backstage/plugin-scaffolder-backend`.

This module provides custom actions for integrating Argo CD with Backstage templates, enabling automated creation of Argo CD resources such as projects and applications.

## Installation

Install the package in your Backstage backend:

```bash
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-argocd
```

### New Backend System

Add the module to your backend in `packages/backend/src/index.ts`:

```typescript
const backend = createBackend();
// ... other plugins
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-argocd'),
);
backend.start();
```

## Configuration

Add your ArgoCD actions to your templates. See the [example file](./examples/01-argocd-createresource.yml) in this repository for complete usage examples.

```yaml
action: argocd:create-resources
id: create-argocd-resources
name: Create ArgoCD Resources
input:
  appName: some-app
  argoInstance: some-instance
  namespace: some-namespace
  repoUrl: https://github.com/somebody/some-repo
  path: ./some/path
  label: some-label
  projectName: some-project
```

## Available Actions

### `argocd:create-resources`

Creates Argo CD resources including a project and application in a specified Argo CD instance.

#### Input Parameters

| Parameter      | Type     | Required | Description                                                                             |
| -------------- | -------- | -------- | --------------------------------------------------------------------------------------- |
| `appName`      | `string` | Yes      | The name of the application to be created                                               |
| `argoInstance` | `string` | Yes      | The name of the Argo CD Instance as configured in app-config.yaml                       |
| `namespace`    | `string` | Yes      | The namespace Argo CD will use for resource deployment                                  |
| `repoUrl`      | `string` | Yes      | The repository URL that will be used in the Argo CD project and application             |
| `path`         | `string` | Yes      | The path of the resources in the repository that Argo CD will watch                     |
| `label`        | `string` | No       | The label used by Backstage to find applications. Defaults to `appName` if not provided |
| `projectName`  | `string` | No       | The name of the project. Defaults to `appName` if not provided                          |

#### Outputs

| Name             | Type     | Description                                                                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `applicationUrl` | `string` | The URL to the ArgoCD application in the format `https://<instance-url>/applications/argocd/<app-name>?view=tree&resource=` |
