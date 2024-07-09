import moment from 'moment';

import {
  ProcessInstance,
  ProcessInstanceState,
  ProcessInstanceStateValues,
  WorkflowCategory,
  WorkflowDefinition,
  WorkflowExecutionResponse,
  WorkflowFormat,
  WorkflowInfo,
  WorkflowOverview,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

const BASE_DATE = '2023-02-19T11:45:21.123Z';

interface WorkflowOverviewParams {
  suffix?: string;
  workflowId?: string;
  name?: string;
  format?: WorkflowFormat;
  lastTriggeredMs?: number;
  lastRunStatus?: ProcessInstanceStateValues;
  category?: string;
  avgDurationMs?: number;
  description?: string;
}
export function generateTestWorkflowOverview(
  params: WorkflowOverviewParams,
): WorkflowOverview {
  return {
    workflowId: params.workflowId ?? `testWorkflowId${params.suffix}`,
    name: params.name ?? `Test Workflow${params.suffix}`,
    format: params.format ?? 'yaml',
    lastTriggeredMs:
      params.lastTriggeredMs ?? Date.parse('2024-02-09T10:34:56Z'),
    lastRunStatus: params.lastRunStatus ?? ProcessInstanceState.Completed,
    category: params.category ?? 'assessment', // validate input
    avgDurationMs: params.avgDurationMs ?? 1000,
    description: params.description ?? 'Test Workflow Description',
  };
}

export function generateTestWorkflowOverviewList(
  howmany: number,
  inputParams?: WorkflowOverviewParams,
): WorkflowOverviewListResult {
  const res: WorkflowOverviewListResult = {
    items: [],
    totalCount: howmany,
    offset: 0,
    limit: 0,
  };

  for (let i = 0; i < howmany; i++) {
    const params: WorkflowOverviewParams = inputParams ?? {};
    params.suffix = i.toString();
    res.items.push(generateTestWorkflowOverview(params));
  }

  return res;
}

export function generateTestWorkflowInfo(
  id: string = 'test_workflowId',
): WorkflowInfo {
  return {
    id: id,
    serviceUrl: 'mock/serviceurl',
  };
}

export function generateTestExecuteWorkflowResponse(
  id: string = 'test_execId',
): WorkflowExecutionResponse {
  return {
    id: id,
  };
}

export const generateWorkflowDefinition: WorkflowDefinition = {
  id: 'quarkus-backend-workflow-ci-switch',
  version: '1.0',
  specVersion: '0.8',
  name: '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  description:
    '[WF] Create a starter Quarkus Backend application with a CI pipeline - CI Switch',
  annotations: ['test_annotation'],
  states: [
    {
      name: 'Test state',
      type: 'operation',
      end: true,
    },
  ],
};

export function generateProcessInstances(howmany: number): ProcessInstance[] {
  const processInstances: ProcessInstance[] = [];
  for (let i = 0; i < howmany; i++) {
    processInstances.push(generateProcessInstance(i));
  }
  return processInstances;
}

export function generateProcessInstance(id: number): ProcessInstance {
  return {
    id: `processInstance${id}`,
    processName: `name${id}`,
    processId: `proceesId${id}`,
    state: ProcessInstanceState.Active,
    start: BASE_DATE,
    end: moment(BASE_DATE).add(1, 'hour').toISOString(),
    nodes: [],
    endpoint: 'enpoint/foo',
    serviceUrl: 'service/bar',
    source: 'my-source',
    category: WorkflowCategory.INFRASTRUCTURE,
    description: 'test description 1',
    variables: {
      foo: 'bar',
      workflowdata: {
        workflowOptions: {
          'my-category': {
            id: 'next-workflow-1',
            name: 'Next Workflow One',
          },
          'my-secod-category': [
            {
              id: 'next-workflow-20',
              name: 'Next Workflow Twenty',
            },
            {
              id: 'next-workflow-21',
              name: 'Next Workflow Twenty One',
            },
          ],
        },
      },
    },
  };
}
