import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@backstage-community/plugin-orchestrator-common';

import { fakeProcessInstances } from '../__fixtures__/fakeProcessInstance';
import { fakeWorkflowDefinition } from '../__fixtures__/fakeWorkflowDefinition';
import { fakeWorkflowOverviewList } from '../__fixtures__/fakeWorkflowOverviewList';
import { orchestratorApiRef } from '../api';
import { MockOrchestratorClient } from '../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../routes';
import { OrchestratorPage } from './OrchestratorPage';

/** This component is used in order to correctly render nested components using the `TabbedLayout.Route` component. */
const TestRouter: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <Routes>
    <Route path="/*" element={<>{children}</>} />
  </Routes>
);

const meta = {
  title: 'Orchestrator/OrchestratorPage',
  component: OrchestratorPage,
  decorators: [
    (
      Story,
      context: {
        args: {
          items?: WorkflowOverview[];
          api?: MockOrchestratorClient;
          featureFlags?: string[];
        };
      },
    ) => {
      const items = context.args.items || fakeWorkflowOverviewList;
      const mockApi = new MockOrchestratorClient({
        listInstancesResponse: Promise.resolve(fakeProcessInstances),
        listWorkflowOverviewsResponse: Promise.resolve({
          limit: 0,
          offset: 0,
          totalCount: 0,
          items,
        }),
        getWorkflowDefinitionResponse: Promise.resolve(fakeWorkflowDefinition),
      });
      return wrapInTestApp(
        <TestRouter>
          <TestApiProvider apis={[[orchestratorApiRef, mockApi]]}>
            <Story />
          </TestApiProvider>
        </TestRouter>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
} satisfies Meta<typeof OrchestratorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrchestratorPageStory: Story = {
  name: 'Sample 1',
  args: {
    items: fakeWorkflowOverviewList.slice(0, 3),
  },
};
