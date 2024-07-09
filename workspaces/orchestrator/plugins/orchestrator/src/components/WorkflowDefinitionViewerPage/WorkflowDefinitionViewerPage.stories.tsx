import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { fakeWorkflowDefinition } from '../../__fixtures__/fakeWorkflowDefinition';
import { fakeWorkflowOverview } from '../../__fixtures__/fakeWorkflowOverview';
import { veryLongString } from '../../__fixtures__/veryLongString';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import {
  orchestratorRootRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';

const meta = {
  title: 'Orchestrator/WorkflowDefinitionViewerPage',
  component: WorkflowDefinitionViewerPage,
  decorators: [
    (
      Story,
      context: {
        args: {
          workflowOverview?: WorkflowOverview;
          api?: MockOrchestratorClient;
          featureFlags?: string[];
        };
      },
    ) => {
      const defaultApi = new MockOrchestratorClient({
        getWorkflowOverviewResponse: Promise.resolve(
          context.args.workflowOverview || fakeWorkflowOverview,
        ),
        getWorkflowDefinitionResponse: Promise.resolve(fakeWorkflowDefinition),
      });
      return wrapInTestApp(
        <TestApiProvider
          apis={[[orchestratorApiRef, context.args.api || defaultApi]]}
        >
          <Routes>
            <Route
              path={workflowDefinitionsRouteRef.path}
              element={<Story />}
            />
          </Routes>
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
          routeEntries: [`/workflows/yaml/${fakeWorkflowDefinition.id}`],
        },
      );
    },
  ],
} satisfies Meta<typeof WorkflowDefinitionViewerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowDefinitionViewerPageStory: Story = {
  name: 'Has running workflows',
};

export const NoRunningWorkflows: Story = {
  name: 'No running workflows',
  args: {
    workflowOverview: {
      ...fakeWorkflowOverview,
      avgDurationMs: undefined,
      lastTriggeredMs: undefined,
      lastRunStatus: undefined,
    },
  },
};

export const LongDesription: Story = {
  name: 'Long description',
  args: {
    workflowOverview: {
      ...fakeWorkflowOverview,
      description: veryLongString,
    },
  },
};

export const Loading: Story = {
  name: 'Loading',
  args: {
    api: new MockOrchestratorClient({
      getWorkflowOverviewResponse: new Promise(() => {}),
      getWorkflowDefinitionResponse: new Promise(() => {}),
    }),
  },
};
