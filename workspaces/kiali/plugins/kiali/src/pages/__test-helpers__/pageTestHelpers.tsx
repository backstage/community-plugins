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

import { Entity } from '@backstage/catalog-model';

/**
 * Creates a mock KialiApi with common configuration for page tests
 */
export const createMockKialiApi = () =>
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
    getClustersServices: jest.fn().mockResolvedValue({
      services: [
        {
          name: 'test-service',
          namespace: 'default',
          cluster: 'Kubernetes',
          health: {
            requests: {
              inbound: {},
              outbound: {},
              healthAnnotations: {},
            },
          },
          istioSidecar: true,
          istioAmbient: false,
        },
      ],
      validations: {},
    }),
    getClustersWorkloads: jest.fn().mockResolvedValue({
      workloads: [
        {
          name: 'test-workload',
          namespace: 'default',
          cluster: 'Kubernetes',
          type: 'Deployment',
          health: {},
          istioSidecar: true,
          istioAmbient: false,
        },
      ],
      validations: {},
    }),
    setEntity: jest.fn(),
    setAnnotation: jest.fn(),
  }) as any;

/**
 * Creates a mock entity for testing
 */
export const createMockEntity = (namespace = 'default'): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'test-entity',
    namespace: 'default',
    annotations: {
      'kiali.io/namespace': namespace,
    },
  },
});

/**
 * Common error messages for tests
 */
export const ERROR_MESSAGES = {
  namespaces: 'Failed to fetch namespaces',
  services: 'Failed to fetch services',
  workloads: 'Failed to fetch workloads',
  apps: 'Failed to fetch apps',
} as const;
