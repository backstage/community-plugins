# Argo Workflows plugins for Backstage

This workspace contains the Backstage plugins for [Argo Workflows](https://argoproj.github.io/workflows/), providing CI/CD visibility directly in the Backstage catalog.

## Features

- **Workflow runs table** — Lists workflow executions with status, task status bar, duration, and start date.
- **Task status bar** — Horizontal stacked bar showing the proportion of task statuses (similar to the Tekton plugin).
- **Interactive DAG visualization** — Directed acyclic graph of workflow tasks with pan, zoom, and click-to-inspect.
- **Node detail panel** — Click a DAG node to see task type, duration, timestamps, and error messages.
- **Multi-instance support** — Connect to multiple Argo Workflows servers and query them by name.
- **Search and filter** — Filter workflows by name and status.

## Plugins

| Package                                                              | Role            | Description                                   |
| -------------------------------------------------------------------- | --------------- | --------------------------------------------- |
| [`plugin-argo-workflows`](./plugins/argo-workflows/)                 | Frontend plugin | CI/CD tab with workflow table and DAG views.  |
| [`plugin-argo-workflows-backend`](./plugins/argo-workflows-backend/) | Backend plugin  | Proxies requests to the Argo Workflows API.   |
| [`plugin-argo-workflows-common`](./plugins/argo-workflows-common/)   | Common library  | Shared types, annotations, and serialization. |
| [`plugin-argo-workflows-react`](./plugins/argo-workflows-react/)     | React library   | Reusable hooks and components.                |

## Getting started

```sh
yarn install
yarn start
```

## Development

```sh
# Start the dev app
yarn start

# Run tests
yarn test

# Run linting
yarn lint:all

# Type check
yarn tsc

# Generate API reports
yarn build:api-reports
```
