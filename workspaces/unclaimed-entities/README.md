# Unclaimed Entities Backstage Workspace

This is a Backstage workspace for developing and testing the unclaimed entities plugin.

## What is the Unclaimed Entities Plugin?

The unclaimed entities plugin automatically discovers repositories from your existing GitHub and Azure DevOps integrations that don't have `catalog-info.yaml` files and creates "Unclaimed" catalog entities for them. This helps identify repositories that could benefit from being properly cataloged in Backstage.

## Getting Started

To start the app, run:

```sh
yarn install
yarn start
```

To generate knip reports for this app, run:

```sh
yarn backstage-repo-tools knip-reports
```

## Plugin Development

The main plugin code is located in:

- `plugins/catalog-backend-module-unclaimed-entities/` - Backend module for the catalog plugin

## Configuration

See the [plugin README](./plugins/catalog-backend-module-unclaimed-entities/README.md) for detailed configuration instructions.
