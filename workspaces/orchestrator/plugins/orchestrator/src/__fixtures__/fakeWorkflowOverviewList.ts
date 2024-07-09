import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeWorkflowOverviewList: WorkflowOverview[] = [
  {
    workflowId: 'quarkus-backend-workflow-ci-switch',
    name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'COMPLETED',
    description:
      '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  },
  {
    workflowId: 'orchestrator-ansible-job-parallel-error-handler',
    name: '[WF] Ansible Job - Parallel/ERROR',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'SUSPENDED',
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform - ERROR Handling',
  },
  {
    workflowId: 'orchestrator-ansible-job',
    name: '[WF] Ansible Job',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'ERROR',
    description:
      '[WF] Launch an Ansible Job within Ansible Automation Platform',
  },
  {
    workflowId: 'quarkus-backend-workflow-extended',
    name: '[WF] Create a Quarkus Backend application with a CI pipeline - Extended',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'SUSPENDED',
    description:
      '[WF] Create a starter Quarkus Backend application with a CI pipeline - Extended',
  },
  {
    workflowId: 'workflow_actions',
    name: 'Workflow name',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'COMPLETED',
    description: 'Workflow description',
  },
  {
    workflowId: 'yamlgreet',
    name: 'Greeting workflow',
    format: 'yaml',
    lastTriggeredMs: 1701765793,
    category: 'Infrastructure',
    avgDurationMs: 5000,
    lastRunStatus: 'ERROR',
    description: 'YAML based greeting workflow',
  },
];
