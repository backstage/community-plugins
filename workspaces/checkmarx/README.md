# Checkmarx Plugin for Backstage

Standalone Backstage workspace that implements a Checkmarx plugin with:

- entity overview card
- `/checkmarx` entity content page
- related entities overview for systems
- backend proxy that resolves the latest completed scan and its `scan-summary`
- shared common package for annotations, types, and entity helpers

The demo catalog in [examples/entities.yaml](./examples/entities.yaml) includes
`checkmarx.org/project-id` and `checkmarx.org/default-branch` annotations.

## Run

```sh
yarn install
yarn start
```

## Packages

1. [Frontend plugin](./plugins/checkmarx/README.md)
2. [Shared common/types package](./plugins/checkmarx-react/README.md)
3. [Backend plugin](./plugins/checkmarx-backend/README.md)
