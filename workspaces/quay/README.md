# Quay plugin for Backstage

This workspace contains plugins for viewing and managing [Quay](https://docs.quay.io/) container registry data within Backstage. They let you surface information about your container images and automate common Quay tasks from your Backstage application.

## Plugins

This workspace is composed of several packages:

- [quay](./plugins/quay/) — The frontend plugin that displays information about your container images from the Quay registry on entity pages. Operator docs: [README](./plugins/quay/README.md); contributors: [CONTRIBUTING](./plugins/quay/CONTRIBUTING.md)
- [quay-backend](./plugins/quay-backend/) — The backend plugin that queries the Quay API, with support for permissions and OAuth2 access token authentication. Operator docs: [README](./plugins/quay-backend/README.md); contributors: [CONTRIBUTING](./plugins/quay-backend/CONTRIBUTING.md)
- [quay-actions](./plugins/quay-actions/) — A scaffolder backend module providing software template actions for Quay, such as creating a Quay repository. Operator docs: [README](./plugins/quay-actions/README.md); contributors: [CONTRIBUTING](./plugins/quay-actions/CONTRIBUTING.md)
- [quay-common](./plugins/quay-common/) — A common library containing shared types and utilities used by the other Quay plugins. Operator docs: [README](./plugins/quay-common/README.md); contributors: [CONTRIBUTING](./plugins/quay-common/CONTRIBUTING.md)

The `packages/app` and `packages/backend` directories are leftover stubs and are **not** used for day-to-day development. Prefer each package's `dev/` harness — see the contributor guides above.

## Quick start

You will find detailed installation instructions in each plugin's README file.

```sh
# From your Backstage root directory

# install the frontend plugin
yarn --cwd packages/app add @backstage-community/plugin-quay

# install the backend plugin
yarn --cwd packages/backend add @backstage-community/plugin-quay-backend
```

See the [quay](./plugins/quay/README.md) and [quay-backend](./plugins/quay-backend/README.md) READMEs for configuration and entity page setup.
