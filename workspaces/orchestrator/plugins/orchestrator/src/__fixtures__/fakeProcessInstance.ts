import moment from 'moment';

import {
  ProcessInstance,
  ProcessInstanceState,
  WorkflowCategory,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeWorkflowOverviewList } from './fakeWorkflowOverviewList';

let id = 10;
const baseDate = '2023-11-16T10:50:34.346Z';
export const fakeProcessInstance1: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[0].name,
  processId: fakeWorkflowOverviewList[0].workflowId,
  state: ProcessInstanceState.Error,
  start: baseDate,
  end: moment(baseDate).add(13, 'hours').toISOString(),
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

export const fakeCompletedInstance: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[1].name,
  processId: fakeWorkflowOverviewList[1].workflowId,
  state: ProcessInstanceState.Completed,
  start: moment(baseDate).add(1, 'hour').toISOString(),
  end: moment(baseDate).add(1, 'day').toISOString(),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
  category: WorkflowCategory.ASSESSMENT,
  description: 'test description 2',
};

export const fakeActiveInstance: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[2].name,
  processId: fakeWorkflowOverviewList[2].workflowId,
  state: ProcessInstanceState.Active,
  start: moment(baseDate).add(2, 'hours').toISOString(),
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
  category: WorkflowCategory.INFRASTRUCTURE,
  description: 'test description 3',
};

export const fakeProcessInstance4: ProcessInstance = {
  id: `12f767c1-9002-43af-9515-62a72d0eaf${id++}`,
  processName: fakeWorkflowOverviewList[3].name,
  processId: fakeWorkflowOverviewList[3].workflowId,
  state: ProcessInstanceState.Suspended,
  start: baseDate,
  nodes: [],
  variables: {},
  endpoint: 'enpoint/foo',
  serviceUrl: 'service/bar',
  source: 'my-source',
  category: WorkflowCategory.INFRASTRUCTURE,
  description: 'test description 4',
};

export const fakeProcessInstances = [
  fakeProcessInstance1,
  fakeCompletedInstance,
  fakeActiveInstance,
  fakeProcessInstance4,
];
