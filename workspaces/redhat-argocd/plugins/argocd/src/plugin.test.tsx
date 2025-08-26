/*
 * Copyright 2024 The Backstage Authors
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
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';

import { configApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import {
  MockConfigApi,
  MockPermissionApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';

import { screen, waitFor } from '@testing-library/react';

import { mockApplication, mockEntity, mockRevision } from '../dev/__data__';
import { argoCDApiRef } from './api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
} from './plugin';
import { rootRouteRef } from './routes';

jest.mock('./components/DeploymentLifeCycle/DeploymentLifecycle', () => () => (
  <>Deployment lifecycle</>
));

jest.mock('./components/DeploymentSummary/DeploymentSummary', () => () => (
  <>Deployment summary</>
));
describe('argocd', () => {
  const mockedApi: any = {
    listApps: async () => {
      return { items: [mockApplication] };
    },
    getRevisionDetails: async () => {
      return mockRevision;
    },
    getRevisionDetailsList: async () => {
      return [mockRevision];
    },
  };
  const mockKubernetesApi: any = {
    decorateRequestBodyForAuth: () => {
      return () => {};
    },
    getCredentials: () => {
      return '';
    },
  };

  const mockPermissionApi = new MockPermissionApi();

  const mockConfiguration = new MockConfigApi({
    backend: {
      baseUrl: 'http://localhost:7007',
      listen: {
        port: 7007,
      },
    },
    argocd: {
      appLocatorMethods: [],
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <TestApiProvider
        apis={[
          [argoCDApiRef, mockedApi],
          [configApiRef, mockConfiguration],
          [permissionApiRef, mockPermissionApi],
          [kubernetesApiRef, mockKubernetesApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>{children}</EntityProvider>
      </TestApiProvider>
    );
  };

  it('should export plugin', () => {
    const [argoApi] = argocdPlugin.getApis();
    expect(argocdPlugin).toBeDefined();

    expect(
      argoApi.factory({
        identityApi: { getCredentials: () => {} },
        configApi: mockConfiguration,
      }),
    ).toBeDefined();
  });

  it('should render the deployment lifecycle extension', async () => {
    jest.useRealTimers();
    await renderInTestApp(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ArgocdDeploymentLifecycle />} />
        </Routes>
      </Wrapper>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Deployment lifecycle')).toBeInTheDocument();
    });
  });

  it('should render the deployment summary extension', async () => {
    await renderInTestApp(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ArgocdDeploymentSummary />} />
        </Routes>
      </Wrapper>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Deployment summary')).toBeInTheDocument();
    });
  });
});
