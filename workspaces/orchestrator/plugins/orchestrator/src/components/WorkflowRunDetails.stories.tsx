import React from 'react';

import { Content, InfoCard } from '@backstage/core-components';
import { wrapInTestApp } from '@backstage/test-utils';

import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import { Meta, StoryObj } from '@storybook/react';

import { fakeCompletedInstance } from '../__fixtures__/fakeProcessInstance';
import { fakeWorkflowRunDetail } from '../__fixtures__/fakeWorkflowRunDetails';
import { veryLongString } from '../__fixtures__/veryLongString';
import { orchestratorRootRouteRef } from '../routes';
import { WorkflowRunDetails } from './WorkflowRunDetails';

const TopRowCard = styled(InfoCard)({
  height: '20rem',
});

const meta = {
  title: 'Orchestrator/WorkflowDetails',
  component: WorkflowRunDetails,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    layout: 'padded',
  },
  decorators: [
    Story =>
      wrapInTestApp(
        <Content noPadding>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TopRowCard title="Details" divider={false}>
                <Story />
              </TopRowCard>
            </Grid>
            <Grid item xs={6}>
              <TopRowCard title="Another card" divider={false}>
                <p>Nothing fancy here...</p>
              </TopRowCard>
            </Grid>
          </Grid>
        </Content>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      ),
  ],
} satisfies Meta<typeof WorkflowRunDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Story1: Story = {
  name: 'Very long description',
  args: {
    assessedBy: fakeCompletedInstance,
    details: {
      ...fakeWorkflowRunDetail,
      description: veryLongString,
    },
  },
};
