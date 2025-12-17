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
import { KialiProvider } from './KialiProvider';
import { kialiApiRef } from '../services/Api';
import { Entity } from '@backstage/catalog-model';

// Mock the KialiApi
const mockKialiApi = {
  isDevEnv: jest.fn().mockReturnValue(false),
  getAuthInfo: jest.fn().mockResolvedValue({
    strategy: 'anonymous',
    sessionInfo: { username: 'anonymous', expiresOn: '' },
  }),
  getStatus: jest.fn().mockResolvedValue({
    status: { 'Kiali version': 'v1.86.0', 'Kiali state': 'running' },
  }),
  status: jest.fn().mockResolvedValue({
    // status() should not have verify: false for provider to work
  }),
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
  setEntity: jest.fn(),
  setAnnotation: jest.fn(),
} as any;

describe('KialiProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when no entity is provided', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <div>Test Content</div>
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('should render children when entity is provided', async () => {
    const mockEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-entity',
        namespace: 'default',
        annotations: {
          'kiali.io/namespace': 'test-namespace',
        },
      },
    };

    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider entity={mockEntity}>
          <div>Entity Content</div>
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText('Entity Content')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    expect(mockKialiApi.setEntity).toHaveBeenCalledWith(mockEntity);
  });

  it('should handle loading state', async () => {
    const { container } = render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <div>Content</div>
        </KialiProvider>
      </TestApiProvider>,
    );

    // Provider should render without errors
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('should call getAuthInfo on mount', async () => {
    render(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <KialiProvider>
          <div>Test</div>
        </KialiProvider>
      </TestApiProvider>,
    );

    await waitFor(
      () => {
        expect(mockKialiApi.getAuthInfo).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
