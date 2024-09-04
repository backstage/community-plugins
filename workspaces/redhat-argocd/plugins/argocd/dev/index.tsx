import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { configApiRef } from '@backstage/core-plugin-api';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { MockPermissionApi, TestApiProvider } from '@backstage/test-utils';

import { Box } from '@material-ui/core';
import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import {
  ArgoCDApi,
  argoCDApiRef,
  GetApplicationOptions,
  listAppsOptions,
  RevisionDetailsListOptions,
  RevisionDetailsOptions,
} from '../src/api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
} from '../src/plugin';
import { Application } from '../src/types';
import {
  mockApplication,
  mockArgocdConfig,
  mockRevision,
  mockRevisions,
  preProdApplication,
  prodApplication,
} from './__data__';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage-argocd',
    description: 'rhtap argocd plugin',
    annotations: {
      'argocd/app-selector': 'rht.gitops.com/quarks-app-bootstrap',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};
const mockPermissionApi = new MockPermissionApi();
export class MockArgoCDApiClient implements ArgoCDApi {
  async listApps(_options: listAppsOptions): Promise<any> {
    return { items: [mockApplication, preProdApplication, prodApplication] };
  }

  async getRevisionDetails(_options: RevisionDetailsOptions): Promise<any> {
    return mockRevision;
  }
  async getRevisionDetailsList(
    _options: RevisionDetailsListOptions,
  ): Promise<any> {
    return mockRevisions;
  }
  async getApplication(_options: GetApplicationOptions): Promise<Application> {
    return mockApplication;
  }
}

createDevApp()
  .registerPlugin(argocdPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [configApiRef, new ConfigReader(mockArgocdConfig)],
          [argoCDApiRef, new MockArgoCDApiClient()],
          [permissionApiRef, mockPermissionApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Box margin={2}>
            <ArgocdDeploymentLifecycle />
          </Box>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Lifecycle',
    path: '/argocd/deployment-lifecycle',
  })

  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [configApiRef, new ConfigReader(mockArgocdConfig)],
          [argoCDApiRef, new MockArgoCDApiClient()],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <ArgocdDeploymentSummary />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Summary',
    path: 'argocd/deployment-summary',
  })
  .render();
