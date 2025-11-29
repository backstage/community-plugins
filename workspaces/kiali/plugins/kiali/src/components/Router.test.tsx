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

import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Router, EmbeddedRouter, getRoutes, getEntityRoutes } from './Router';
import { kialiApiRef } from '../services/Api';
import { Entity } from '@backstage/catalog-model';
import { ANNOTATION_SUPPORTED } from '@backstage-community/plugin-kiali-common';

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
  getNamespaces: jest.fn().mockResolvedValue([]),
  getServerConfig: jest.fn().mockResolvedValue({
    installationTag: 'Kiali Console',
    istioNamespace: 'istio-system',
  }),
  setEntity: jest.fn(),
  setAnnotation: jest.fn(),
} as any;

describe('Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Router component', async () => {
    const { container } = await renderInTestApp(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <Router />
      </TestApiProvider>,
    );

    // Router should render without errors
    expect(container).toBeInTheDocument();
  });

  it('should render EmbeddedRouter with valid annotation', async () => {
    const mockEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-entity',
        namespace: 'default',
        annotations: {
          [ANNOTATION_SUPPORTED[0]]: 'default',
        },
      },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <EntityProvider entity={mockEntity}>
          <EmbeddedRouter />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(mockKialiApi.setEntity).toHaveBeenCalledWith(mockEntity);
  });

  it('should show KialiNoAnnotation when entity has no valid annotation', async () => {
    const mockEntity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-entity',
        namespace: 'default',
        annotations: {},
      },
    };

    await renderInTestApp(
      <TestApiProvider apis={[[kialiApiRef, mockKialiApi]]}>
        <EntityProvider entity={mockEntity}>
          <EmbeddedRouter />
        </EntityProvider>
      </TestApiProvider>,
    );

    // Should not call setEntity when annotation is missing
    expect(mockKialiApi.setEntity).not.toHaveBeenCalled();
  });

  it('should render getRoutes with dev mode', () => {
    const routes = getRoutes(true);
    expect(routes).toBeDefined();
  });

  it('should render getRoutes without dev mode', () => {
    const routes = getRoutes(false);
    expect(routes).toBeDefined();
  });

  it('should render getEntityRoutes', () => {
    const routes = getEntityRoutes();
    expect(routes).toBeDefined();
  });
});
