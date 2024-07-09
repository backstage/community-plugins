import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeWorkflowOverview: WorkflowOverview = {
  workflowId: 'quarkus-backend-workflow-ci-switch',
  name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  lastTriggeredMs: 1697276096000,
  lastRunStatus: 'COMPLETED',
  category: 'ci',
  avgDurationMs: 150000,
  description:
    'Create a starter Quarkus Backend application with a CI pipeline',
  format: 'yaml',
};
