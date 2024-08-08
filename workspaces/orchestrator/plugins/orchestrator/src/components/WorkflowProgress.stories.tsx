import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { fakeNodeInstances } from '../__fixtures__/fakeNodeInstances';
import { WorkflowProgress } from './WorkflowProgress';

const meta = {
  title: 'Orchestrator/WorkflowProgress',
  component: WorkflowProgress,
  decorators: [Story => <Story />],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    workflowStatus: {
      control: 'select',
      options: ['ACTIVE', 'COMPLETED', 'ABORTED', 'SUSPENDED', 'ERROR'],
    },
    workflowError: {
      control: 'object',
    },
  },
} satisfies Meta<typeof WorkflowProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SampleStory: Story = {
  name: 'Sample',
  args: {
    workflowNodes: fakeNodeInstances,
    workflowStatus: 'ACTIVE',
  },
};
