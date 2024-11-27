# Kubernetes actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [Kubernetes](https://kubernetes.io/docs/home/).

The following actions are currently supported in this module:

- Create a kubernetes namespace

## Installation

Run the following command to install the action package in your Backstage project

```bash
yarn workspace backend add @backstage-community/scaffolder-backend-module-kubernetes
```

### Installing the action on the backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/scaffolder-backend-module-kubernetes'),
);

backend.start();
```

## Configuration

Add the Kubernetes actions to your templates, see the [example](./examples/templates/01-kubernetes-template.yaml) file in this repository for complete usage examples

```yaml
action: kubernetes:create-namespace
id: create-kubernetes-namespace
name: Create kubernetes namespace
input:
  namespace: foo
  clusterRef: bar
  token: TOKEN
  skipTLSVerify: false
  caData: Zm9v
  labels: app.io/type=ns; app.io/managed-by=org;
```

## Usage

### Action: kubernetes:create-namespace

#### Input

| Parameter Name |  Type   | Required | Description                                         | Example                                |
| -------------- | :-----: | :------: | --------------------------------------------------- | -------------------------------------- |
| namespace      | string  |   Yes    | Kubernetes namespace name                           | foo                                    |
| clusterRef     | string  |    No    | Cluster resource entity reference from the catalog  | bar                                    |
| url            | string  |    No    | API url of the kubernetes cluster                   | <https://api.foo.redhat.com:6443>      |
| token          | string  |    No    | Kubernetes API bearer token used for authentication |                                        |
| skipTLSVerify  | boolean |    No    | If true, certificate verification is skipped        | false                                  |
| caData         | string  |    No    | Base64 encoded certificate data                     |                                        |
| label          | string  |    No    | Labels that will be applied to the namespace        | app.io/type=ns; app.io/managed-by=org; |

#### Output

This action doesn't have any outputs.
