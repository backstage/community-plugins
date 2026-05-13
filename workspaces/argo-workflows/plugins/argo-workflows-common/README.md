# Argo Workflows Common plugin

Shared types, annotations, and serialization utilities for the Argo Workflows plugin.

This package is used by both the frontend and backend plugins. It contains no runtime dependencies on React or Node.js.

## Installation

```console
yarn add @backstage-community/plugin-argo-workflows-common
```

## Exports

### Types

- `WorkflowStatus` — Union type: `'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Error'`
- `Workflow` — Main workflow model with `metadata` and `status`
- `WorkflowMetadata` — Kubernetes metadata (name, namespace, uid, labels, annotations)
- `WorkflowNode` — Individual node in a workflow DAG
- `WorkflowStatusDetail` — Overall workflow status with nodes map
- `WorkflowListResponse` — API list response wrapper

### Annotations

**Argo Workflows-specific:**

- `ARGO_WORKFLOWS_LABEL_SELECTOR_ANNOTATION` — `argoworkflows.argoproj.io/workflow-selector`
- `ARGO_WORKFLOWS_INSTANCE_ANNOTATION` — `argoworkflows.argoproj.io/instance-name`

**Kubernetes-compatible** (same annotations used by the Backstage Kubernetes and Tekton plugins):

- `backstage.io/kubernetes-id` — Matches workflows by label.
- `backstage.io/kubernetes-namespace` — Scopes discovery to a namespace.
- `backstage.io/kubernetes-label-selector` — Custom label selector (takes precedence over `kubernetes-id`).

### Functions

- `isArgoWorkflowsAvailable(entity)` — Returns `true` if the entity has the required annotation.
- `parseWorkflow(raw)` — Parses a raw JSON object into a typed `Workflow`.
- `formatWorkflow(workflow)` — Serializes a `Workflow` back to a plain JSON object.

For more information about the Argo Workflows plugin, see the [frontend plugin documentation](../argo-workflows/README.md).
