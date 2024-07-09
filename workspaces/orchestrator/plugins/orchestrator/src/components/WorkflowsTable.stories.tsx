import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@backstage-community/plugin-orchestrator-common';

import { fakeWorkflowOverviewList } from '../__fixtures__/fakeWorkflowOverviewList';
import { orchestratorApiRef } from '../api';
import { MockOrchestratorClient } from '../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../routes';
import { WorkflowsTable } from './WorkflowsTable';

const meta = {
  title: 'Orchestrator/WorkflowsTable',
  component: WorkflowsTable,
  decorators: [
    (Story, context) =>
      wrapInTestApp(
        <TestApiProvider
          apis={[
            [
              orchestratorApiRef,
              new MockOrchestratorClient({
                listWorkflowOverviewsResponse: Promise.resolve({
                  limit: 0,
                  offset: 0,
                  totalCount: 1,
                  items: (context.args as { items: WorkflowOverview[] }).items,
                }),
              }),
            ],
          ]}
        >
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      ),
  ],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof WorkflowsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowsTableStory: Story = {
  name: 'Sample 1',
  args: {
    items: fakeWorkflowOverviewList.slice(0, 3),
  },
};
