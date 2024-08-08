import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { generateFakeProcessInstances } from '../__fixtures__/fakeLongProcessInstanceList';
import { fakeWorkflowOverviewList } from '../__fixtures__/fakeWorkflowOverviewList';
import { orchestratorApiRef } from '../api';
import { MockOrchestratorClient } from '../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../routes';
import { WorkflowRunsTabContent } from './WorkflowRunsTabContent';

const meta = {
  title: 'Orchestrator/WorkflowRunsTabContent',
  component: WorkflowRunsTabContent,
  decorators: [
    (Story, context) => {
      const api = new MockOrchestratorClient({
        listInstancesResponse: Promise.resolve(
          generateFakeProcessInstances(
            (context.args as { length: number }).length,
          ),
        ),
        listWorkflowOverviewsResponse: Promise.resolve({
          limit: 0,
          offset: 0,
          totalCount: 1,
          items: fakeWorkflowOverviewList,
        }),
      });

      return wrapInTestApp(
        <TestApiProvider apis={[[orchestratorApiRef, api]]}>
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WorkflowRunsTabContent>;

type Story = StoryObj<typeof meta>;

export const WorkflowRunsTabContentStory: Story = {
  name: 'Short list',
  args: {
    length: 3,
  },
};

export const WorkflowRunsTabContentLongListStory: Story = {
  name: 'Long list',
  args: {
    length: 100,
  },
};

export default meta;
