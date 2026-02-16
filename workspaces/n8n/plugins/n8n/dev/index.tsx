/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createDevApp } from '@backstage/dev-utils';
import {
  Content,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
} from '@backstage/core-components';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import Grid from '@material-ui/core/Grid';
import {
  n8nPlugin,
  EntityN8nContent,
  EntityN8nLatestExecutionCard,
} from '../src';
import { n8nApiRef } from '../src/api';
import type { N8nApi } from '../src/api/N8nApi';
import type { N8nWorkflow, N8nExecution } from '../src/api/types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const mockWorkflows: N8nWorkflow[] = [
  {
    id: '1001',
    name: 'Deploy to Production',
    active: true,
    createdAt: '2025-11-15T10:00:00.000Z',
    updatedAt: '2026-02-06T14:30:00.000Z',
    tags: [
      { id: '1', name: 'production' },
      { id: '2', name: 'deploy' },
    ],
  },
  {
    id: '1002',
    name: 'Sync Customer Data',
    active: true,
    createdAt: '2025-12-01T08:00:00.000Z',
    updatedAt: '2026-02-07T09:15:00.000Z',
    tags: [{ id: '3', name: 'data-sync' }],
  },
  {
    id: '1003',
    name: 'Send Weekly Report',
    active: false,
    createdAt: '2025-10-20T12:00:00.000Z',
    updatedAt: '2026-01-15T16:45:00.000Z',
    tags: [{ id: '4', name: 'reporting' }],
  },
  {
    id: '1004',
    name: 'Backup Database',
    active: true,
    createdAt: '2025-09-01T06:00:00.000Z',
    updatedAt: '2026-02-07T03:00:00.000Z',
    tags: [
      { id: '5', name: 'backup' },
      { id: '6', name: 'database' },
    ],
  },
];

const mockExecutionsByWorkflow: Record<string, N8nExecution[]> = {
  '1001': [
    {
      id: '5001',
      finished: true,
      mode: 'trigger',
      startedAt: '2026-02-07T14:30:00.000Z',
      stoppedAt: '2026-02-07T14:30:12.000Z',
      workflowId: '1001',
      status: 'success',
      workflowName: 'Deploy to Production',
    },
    {
      id: '5003',
      finished: true,
      mode: 'webhook',
      startedAt: '2026-02-07T10:00:00.000Z',
      stoppedAt: '2026-02-07T10:01:30.000Z',
      workflowId: '1001',
      status: 'error',
      workflowName: 'Deploy to Production',
    },
    {
      id: '5005',
      finished: true,
      mode: 'manual',
      startedAt: '2026-02-06T18:30:00.000Z',
      stoppedAt: '2026-02-06T18:32:00.000Z',
      workflowId: '1001',
      status: 'success',
      workflowName: 'Deploy to Production',
    },
  ],
  '1002': [
    {
      id: '5002',
      finished: true,
      mode: 'trigger',
      startedAt: '2026-02-07T13:00:00.000Z',
      stoppedAt: '2026-02-07T13:02:15.000Z',
      workflowId: '1002',
      status: 'success',
      workflowName: 'Sync Customer Data',
    },
    {
      id: '5006',
      finished: false,
      mode: 'trigger',
      startedAt: '2026-02-07T09:00:00.000Z',
      stoppedAt: '',
      workflowId: '1002',
      status: 'running',
      workflowName: 'Sync Customer Data',
    },
  ],
  '1003': [
    {
      id: '5004',
      finished: true,
      mode: 'trigger',
      startedAt: '2026-02-07T08:00:00.000Z',
      stoppedAt: '2026-02-07T08:05:00.000Z',
      workflowId: '1003',
      status: 'success',
      workflowName: 'Send Weekly Report',
    },
  ],
  '1004': [
    {
      id: '5007',
      finished: true,
      mode: 'trigger',
      startedAt: '2026-02-07T03:00:00.000Z',
      stoppedAt: '2026-02-07T03:10:00.000Z',
      workflowId: '1004',
      status: 'success',
      workflowName: 'Backup Database',
    },
    {
      id: '5008',
      finished: true,
      mode: 'trigger',
      startedAt: '2026-02-06T03:00:00.000Z',
      stoppedAt: '2026-02-06T03:09:45.000Z',
      workflowId: '1004',
      status: 'error',
      workflowName: 'Backup Database',
    },
  ],
};

const mockApi: N8nApi = {
  getWorkflows: async () => {
    await delay(300);
    return mockWorkflows;
  },
  getWorkflow: async (id: string) => {
    await delay(200);
    const wf = mockWorkflows.find(w => w.id === id);
    if (!wf) throw new Error(`Workflow ${id} not found`);
    return wf;
  },
  getExecutions: async (workflowId: string, limit?: number) => {
    await delay(250);
    const execs = mockExecutionsByWorkflow[workflowId] ?? [];
    return execs.slice(0, limit ?? 20);
  },
  activateWorkflow: async (id: string) => {
    await delay(500);
    return { ...mockWorkflows.find(w => w.id === id)!, active: true };
  },
  deactivateWorkflow: async (id: string) => {
    await delay(500);
    return { ...mockWorkflows.find(w => w.id === id)!, active: false };
  },
};

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-service',
    description: 'An example service with n8n workflows',
    annotations: {
      'n8n.io/workflow-id': '1001,1002,1003,1004',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-platform',
  },
};

const EntityOverviewPage = () => (
  <EntityProvider entity={mockEntity}>
    <Page themeId="service">
      <Header
        title="example-service"
        subtitle="An example service with n8n workflows"
      >
        <HeaderLabel label="Owner" value="team-platform" />
        <HeaderLabel label="Lifecycle" value="production" />
      </Header>
      <Content>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <InfoCard title="About" variant="gridItem">
              <Grid container>
                <Grid item xs={4}>
                  <b>Owner</b>
                </Grid>
                <Grid item xs={8}>
                  team-platform
                </Grid>
                <Grid item xs={4}>
                  <b>Type</b>
                </Grid>
                <Grid item xs={8}>
                  service
                </Grid>
                <Grid item xs={4}>
                  <b>Lifecycle</b>
                </Grid>
                <Grid item xs={8}>
                  production
                </Grid>
                <Grid item xs={4}>
                  <b>Description</b>
                </Grid>
                <Grid item xs={8}>
                  An example service with n8n workflows
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <EntityN8nLatestExecutionCard />
          </Grid>
        </Grid>
      </Content>
    </Page>
  </EntityProvider>
);

createDevApp()
  .registerPlugin(n8nPlugin)
  .registerApi({
    api: n8nApiRef,
    deps: {},
    factory: () => mockApi,
  })
  .addPage({
    title: 'Entity Content',
    path: '/n8n',
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityN8nContent />
      </EntityProvider>
    ),
  })
  .addPage({
    title: 'Entity Overview',
    path: '/n8n-card',
    element: <EntityOverviewPage />,
  })
  .render();
