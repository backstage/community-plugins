# Argo Workflows React library

Reusable React hooks and components for the Argo Workflows plugin.

This package provides the building blocks used by the frontend plugin and can be used independently to build custom Argo Workflows UIs.

## Installation

```console
yarn add @backstage-community/plugin-argo-workflows-react
```

## Components

### WorkflowStatusIcon

Displays a colored Remix Icon representing a workflow execution status.

```tsx
import { WorkflowStatusIcon } from '@backstage-community/plugin-argo-workflows-react';

<WorkflowStatusIcon status="Succeeded" size="medium" />;
```

| Prop     | Type                             | Default    | Description                           |
| -------- | -------------------------------- | ---------- | ------------------------------------- |
| `status` | `WorkflowStatus`                 | —          | The workflow status to display.       |
| `size`   | `'small' \| 'medium' \| 'large'` | `'medium'` | Icon size variant (16px, 24px, 32px). |

### WorkflowStatusBadge

Displays a workflow status as a badge with an icon and text label.

```tsx
import { WorkflowStatusBadge } from '@backstage-community/plugin-argo-workflows-react';

<WorkflowStatusBadge status="Running" />;
```

| Prop     | Type             | Description                     |
| -------- | ---------------- | ------------------------------- |
| `status` | `WorkflowStatus` | The workflow status to display. |

## Hooks

### useArgoWorkflows

Fetches a list of Argo Workflows filtered by label selector.

```tsx
import { useArgoWorkflows } from '@backstage-community/plugin-argo-workflows-react';

const { workflows, loading, error, retry } = useArgoWorkflows({
  labelSelector: 'app=my-service',
  instanceName: 'main', // optional
});
```

### useArgoWorkflowDetail

Fetches a single workflow by namespace and name.

```tsx
import { useArgoWorkflowDetail } from '@backstage-community/plugin-argo-workflows-react';

const { workflow, loading, error } = useArgoWorkflowDetail({
  namespace: 'default',
  name: 'my-workflow-abc123',
  instanceName: 'main', // optional
});
```

## Utilities

### buildDAG

Builds a DAG graph from a Workflow object for visualization.

```tsx
import { buildDAG } from '@backstage-community/plugin-argo-workflows-react';

const graph = buildDAG(workflow);
// graph.nodes: DAGNode[]
// graph.edges: DAGEdge[]
```

For more information about the Argo Workflows plugin, see the [frontend plugin documentation](../argo-workflows/README.md).
