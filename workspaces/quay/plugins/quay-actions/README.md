# Quay actions for Backstage

This module provides [Backstage](https://backstage.io/) template [actions](https://backstage.io/docs/features/software-templates/builtin-actions) for [Quay](https://docs.quay.io/).

The following actions are currently supported in this module:

- Create a Quay repository

## Installation

Run the following command to install the action package in your Backstage project

```bash
yarn workspace backend add @backstage-community/plugin-scaffolder-backend-module-quay
```

### Installing the action on the new backend

Add the following to your `packages/backend/src/index.ts` file:

```ts title="packages/backend/src/index.ts"
const backend = createBackend();

// Add the following line
backend.add(
  import('@backstage-community/plugin-scaffolder-backend-module-quay'),
);

backend.start();
```

## Configuration

Add the Quay actions to your templates, see the [example](./examples/templates/01-quay-template.yaml) file in this repository for complete usage examples

```yaml
action: quay:create-repository
id: create-quay-repo
name: Create quay repo
input:
  baseUrl: https://quay.io
  token: UW1dLVdCTj8uZWNuIW97K1k0XiBkSmppVU9MYzFT
  name: foo
  visibility: public
  description: This is a foo repository
  namespace: bar
  repoKind: image
```

## Usage

### Action: quay:create-repository

#### Input

| Parameter Name |  Type  | Required | Description                                                                       | Example                                  |
| -------------- | :----: | :------: | --------------------------------------------------------------------------------- | ---------------------------------------- |
| name           | string |   Yes    | Quay repository name                                                              | foo                                      |
| visibility     | string |   Yes    | Visibility setting for the created repository, either public or private           | public                                   |
| description    | string |   Yes    | Description for the created repository                                            | This if foo repository                   |
| token          | string |   Yes    | Authentication token, see [docs](https://docs.quay.io/api/)                       | UW1dLVdCTj8uZWNuIW97K1k0XiBkSmppVU9MYzFT |
| baseUrl        | string |    No    | Base url of a quay instance, defaults to <https://quay.io>                        | <https://foo.quay.io>                    |
| namespace      | string |    No    | Namespace to create repository in, defaults to the namespace the token belongs to | bar                                      |
| repoKind       | string |    No    | Created repository kind, either image or application, if empty defaults to image  | image                                    |

#### Output

| Name          |  Type  | Description                                |
| ------------- | :----: | ------------------------------------------ |
| repositoryUrl | string | Quay repository URL created by this action |
