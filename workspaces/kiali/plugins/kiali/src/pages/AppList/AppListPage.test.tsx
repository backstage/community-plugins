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

import { render, screen, waitFor } from '@testing-library/react';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { AppListPage } from './AppListPage';
import { kialiApiRef } from '../../services/Api';
import { KialiProvider } from '../../store/KialiProvider';
import { Entity } from '@backstage/catalog-model';

// Mock the KialiApi
const createMockKialiApi = () =>
  ({
    isDevEnv: jest.fn().mockReturnValue(false),
    getAuthInfo: jest.fn().mockResolvedValue({
      strategy: 'anonymous',
      sessionInfo: { username: 'anonymous', expiresOn: '' },
    }),
    getStatus: jest.fn().mockResolvedValue({
      status: { 'Kiali version': 'v1.86.0', 'Kiali state': 'running' },
    }),
    status: jest.fn().mockResolvedValue({}),
    getNamespaces: jest
      .fn()
      .mockResolvedValue([{ name: 'default', cluster: 'Kubernetes' }]),
    getServerConfig: jest.fn().mockResolvedValue({
      installationTag: 'Kiali Console',
      istioNamespace: 'istio-system',
      clusters: {
        Kubernetes: {},
      },
    }),
    getMeshTls: jest.fn().mockResolvedValue({
      status: 'MTLS_ENABLED',
    }),
    getIstioStatus: jest.fn().mockResolvedValue([]),
    getIstioCertsInfo: jest.fn().mockResolvedValue([]),
    getClustersApps: jest.fn().mockResolvedValue({
      applications: [
        {
          name: 'test-app',
          namespace: 'default',
          cluster: 'Kubernetes',
          health: {},
        },
      ],
    }),
    setEntity: jest.fn(),
    setAnnotation: jest.fn(),
  }) as any;

describe('AppListPage', () => {
  let mockKialiApi: ReturnType<typeof createMockKialiApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockKialiApi = createMockKialiApi();
  });

  it('should render without entity', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getServerConfig).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should render with entity', async () => {
    const mockEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-entity',
        namespace: 'default',
        annotations: {
          'kiali.io/namespace': 'default',
        },
      },
    };

    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <EntityProvider entity={mockEntity}>
          <KialiProvider entity={mockEntity}>
            <AppListPage entity={mockEntity} />
          </KialiProvider>
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(mockKialiApi.setEntity).toHaveBeenCalledWith(mockEntity);
    });
  });

  it('should handle loading state', async () => {
    const { container } = render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('should fetch apps when namespaces are available', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getServerConfig).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should handle error when fetching namespaces fails', async () => {
    const errorApi = createMockKialiApi();
    errorApi.getNamespaces = jest
      .fn()
      .mockRejectedValue(new Error('Failed to fetch namespaces'));

    render(
      <TestApiProvider apis={[[kialiApiRef, errorApi]]}>
        <KialiProvider>
          <AppListPage />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(errorApi.getServerConfig).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(errorApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('should render with ENTITY view', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <AppListPage view="entity" />
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getServerConfig).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getNamespaces).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
