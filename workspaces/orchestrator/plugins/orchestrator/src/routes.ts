import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const orchestratorRootRouteRef = createRouteRef({
  id: 'orchestrator',
});

export const workflowDefinitionsRouteRef = createSubRouteRef({
  id: 'orchestrator/workflows',
  parent: orchestratorRootRouteRef,
  path: '/workflows/:format/:workflowId',
});

export const workflowInstancesRouteRef = createSubRouteRef({
  id: 'orchestrator/instances',
  parent: orchestratorRootRouteRef,
  path: '/instances',
});

export const workflowInstanceRouteRef = createSubRouteRef({
  id: 'orchestrator/instances',
  parent: orchestratorRootRouteRef,
  path: '/instances/:instanceId',
});

export const executeWorkflowRouteRef = createSubRouteRef({
  id: 'orchestrator/workflows/execute',
  parent: orchestratorRootRouteRef,
  path: '/workflows/:workflowId/execute',
});
