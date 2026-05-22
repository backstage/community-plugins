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

import { ConfigReader } from '@backstage/config';
import { JsonObject } from '@backstage/types';
import {
  ArgoWorkflowsService,
  validateLabelSelector,
} from './ArgoWorkflowsService';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

function createService(data: JsonObject, extras?: Record<string, unknown>) {
  return new ArgoWorkflowsService({
    config: new ConfigReader(data),
    logger: mockLogger,
    ...extras,
  });
}

describe('validateLabelSelector', () => {
  it('accepts simple equality selectors', () => {
    expect(validateLabelSelector('app=my-service')).toBeUndefined();
    expect(validateLabelSelector('app==my-service')).toBeUndefined();
    expect(validateLabelSelector('app!=my-service')).toBeUndefined();
  });

  it('accepts set-based selectors', () => {
    expect(validateLabelSelector('env in (prod,staging)')).toBeUndefined();
    expect(validateLabelSelector('env notin (dev,test)')).toBeUndefined();
  });

  it('accepts existence selectors', () => {
    expect(validateLabelSelector('app')).toBeUndefined();
    expect(validateLabelSelector('!app')).toBeUndefined();
  });

  it('accepts comma-separated selectors', () => {
    expect(validateLabelSelector('app=my-service,env=prod')).toBeUndefined();
    expect(
      validateLabelSelector('app=my-service,env in (prod,staging)'),
    ).toBeUndefined();
  });

  it('accepts selectors with DNS prefix keys', () => {
    expect(
      validateLabelSelector('app.kubernetes.io/name=my-service'),
    ).toBeUndefined();
  });

  it('rejects empty selectors', () => {
    expect(validateLabelSelector('')).toBeDefined();
    expect(validateLabelSelector('   ')).toBeDefined();
  });

  it('rejects invalid selectors', () => {
    expect(validateLabelSelector('=value')).toBeDefined();
    expect(validateLabelSelector('key=')).toBeDefined();
    expect(validateLabelSelector('key in ()')).toBeDefined();
  });
});

describe('ArgoWorkflowsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('logs a warning when no argoWorkflows config is present', () => {
      createService({});
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Aucune configuration argoWorkflows'),
      );
    });

    it('logs a warning when no instances are configured', () => {
      createService({ argoWorkflows: { instances: [] } });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Aucune instance Argo Workflows configurée'),
      );
    });

    it('reads Argo API instances from config', () => {
      const service = createService({
        argoWorkflows: {
          defaultInstance: 'main',
          instances: [
            {
              name: 'main',
              baseUrl: 'https://argo.example.com',
              token: 'test-token',
            },
          ],
        },
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(service).toBeDefined();
    });

    it('reads Kubernetes clusterName instances from config', () => {
      const service = createService({
        argoWorkflows: {
          defaultInstance: 'k8s',
          instances: [
            {
              name: 'k8s',
              kubernetes: { clusterName: 'production' },
            },
          ],
        },
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(service).toBeDefined();
    });
  });

  describe('resolveInstance (via listWorkflows)', () => {
    it('throws 503 when no instances are configured', async () => {
      const service = createService({});
      await expect(service.listWorkflows('', 'app=test')).rejects.toThrow(
        'Aucune instance Argo Workflows configurée',
      );
    });

    it('throws 404 when instance name is unknown', async () => {
      const service = createService({
        argoWorkflows: {
          defaultInstance: 'main',
          instances: [
            { name: 'main', baseUrl: 'https://argo.example.com', token: 't' },
          ],
        },
      });
      await expect(
        service.listWorkflows('unknown', 'app=test'),
      ).rejects.toThrow("Instance Argo Workflows 'unknown' non trouvée");
    });

    it('uses default instance when instanceName is empty', async () => {
      const service = createService({
        argoWorkflows: {
          defaultInstance: 'main',
          instances: [
            {
              name: 'main',
              baseUrl: 'https://argo.example.com',
              token: 'test-token',
            },
          ],
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      const result = await service.listWorkflows('', 'app=test');
      expect(result).toEqual([]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://argo.example.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });
  });

  describe('listWorkflows (Argo API)', () => {
    function createArgoService() {
      return createService({
        argoWorkflows: {
          defaultInstance: 'main',
          instances: [
            {
              name: 'main',
              baseUrl: 'https://argo.example.com',
              token: 'test-token',
            },
          ],
        },
      });
    }

    it('rejects invalid label selectors', async () => {
      const service = createArgoService();
      await expect(service.listWorkflows('main', '')).rejects.toThrow(
        'Sélecteur de labels invalide',
      );
    });

    it('calls the Argo API and parses results', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              metadata: {
                name: 'wf-1',
                namespace: 'default',
                uid: 'uid-1',
                creationTimestamp: '2024-01-01T00:00:00Z',
              },
              status: { phase: 'Succeeded' },
            },
          ],
        }),
      });

      const result = await service.listWorkflows('main', 'app=test');
      expect(result).toHaveLength(1);
      expect(result[0].metadata.name).toBe('wf-1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://argo.example.com/api/v1/workflows?listOptions.labelSelector=app%3Dtest',
        expect.any(Object),
      );
    });

    it('scopes query to namespace when provided', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await service.listWorkflows('main', 'app=test', 'production');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://argo.example.com/api/v1/workflows/production?listOptions.labelSelector=app%3Dtest',
        expect.any(Object),
      );
    });

    it('queries cluster-wide when no namespace is provided', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await service.listWorkflows('main', 'app=test');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://argo.example.com/api/v1/workflows?listOptions.labelSelector=app%3Dtest',
        expect.any(Object),
      );
    });

    it('returns empty array when items is null/undefined', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await service.listWorkflows('main', 'app=test');
      expect(result).toEqual([]);
    });

    it('throws when Argo server is unreachable', async () => {
      const service = createArgoService();
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(service.listWorkflows('main', 'app=test')).rejects.toThrow(
        'Le serveur est indisponible',
      );
    });

    it('propagates HTTP error codes', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(service.listWorkflows('main', 'app=test')).rejects.toThrow(
        'Erreur du serveur (HTTP 403)',
      );
    });
  });

  describe('getWorkflow (Argo API)', () => {
    function createArgoService() {
      return createService({
        argoWorkflows: {
          defaultInstance: 'main',
          instances: [
            {
              name: 'main',
              baseUrl: 'https://argo.example.com',
              token: 'test-token',
            },
          ],
        },
      });
    }

    it('calls the Argo API and parses the result', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          metadata: {
            name: 'wf-1',
            namespace: 'default',
            uid: 'uid-1',
            creationTimestamp: '2024-01-01T00:00:00Z',
          },
          status: { phase: 'Running' },
        }),
      });

      const result = await service.getWorkflow('main', 'default', 'wf-1');
      expect(result.metadata.name).toBe('wf-1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://argo.example.com/api/v1/workflows/default/wf-1',
        expect.any(Object),
      );
    });

    it('throws when Argo server is unreachable', async () => {
      const service = createArgoService();
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(
        service.getWorkflow('main', 'default', 'wf-1'),
      ).rejects.toThrow('Le serveur est indisponible');
    });

    it('propagates HTTP error codes', async () => {
      const service = createArgoService();
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(
        service.getWorkflow('main', 'default', 'wf-1'),
      ).rejects.toThrow('Erreur du serveur (HTTP 404)');
    });
  });

  describe('Kubernetes path via clusterName', () => {
    const mockCredentials = { $$type: '@backstage/BackstageCredentials' };

    const mockFetcher = {
      fetchObjectsForService: jest.fn(),
      fetchPodMetricsByNamespaces: jest.fn(),
    };

    const mockClusterSupplier = {
      getClusters: jest.fn(),
    };

    const mockAuthStrategy = {
      getCredential: jest.fn(),
      validateCluster: jest.fn().mockReturnValue([]),
      presentAuthMetadata: jest.fn().mockImplementation(m => m),
    };

    function createK8sService() {
      return createService(
        {
          argoWorkflows: {
            defaultInstance: 'k8s',
            instances: [
              { name: 'k8s', kubernetes: { clusterName: 'production' } },
            ],
          },
        },
        {
          clusterSupplier: mockClusterSupplier,
          fetcher: mockFetcher,
          authStrategy: mockAuthStrategy,
        },
      );
    }

    beforeEach(() => {
      mockClusterSupplier.getClusters.mockResolvedValue([
        {
          name: 'production',
          url: 'https://k8s-prod.example.com',
          authMetadata: { serviceAccountToken: 'prod-token' },
        },
      ]);
      mockAuthStrategy.getCredential.mockResolvedValue({
        type: 'bearer token',
        token: 'prod-token',
      });
    });

    it('lists workflows via the Kubernetes fetcher', async () => {
      mockFetcher.fetchObjectsForService.mockResolvedValueOnce({
        errors: [],
        responses: [
          {
            type: 'customresources',
            resources: [
              {
                metadata: {
                  name: 'wf-k8s',
                  namespace: 'default',
                  uid: 'uid-k8s',
                  creationTimestamp: '2024-01-01T00:00:00Z',
                },
                status: { phase: 'Succeeded' },
              },
            ],
          },
        ],
      });

      const service = createK8sService();
      const result = await service.listWorkflows(
        'k8s',
        'app=test',
        undefined,
        mockCredentials as any,
      );

      expect(result).toHaveLength(1);
      expect(result[0].metadata.name).toBe('wf-k8s');
      expect(mockFetcher.fetchObjectsForService).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: 'k8s',
          labelSelector: 'app=test',
          namespace: undefined,
          customResources: [
            expect.objectContaining({
              group: 'argoproj.io',
              apiVersion: 'v1alpha1',
              plural: 'workflows',
            }),
          ],
        }),
      );
    });

    it('passes namespace to the fetcher', async () => {
      mockFetcher.fetchObjectsForService.mockResolvedValueOnce({
        errors: [],
        responses: [{ type: 'customresources', resources: [] }],
      });

      const service = createK8sService();
      await service.listWorkflows(
        'k8s',
        'app=test',
        'staging',
        mockCredentials as any,
      );

      expect(mockFetcher.fetchObjectsForService).toHaveBeenCalledWith(
        expect.objectContaining({ namespace: 'staging' }),
      );
    });

    it('throws when cluster is not found', async () => {
      mockClusterSupplier.getClusters.mockResolvedValue([
        {
          name: 'other-cluster',
          url: 'https://other.example.com',
          authMetadata: {},
        },
      ]);

      const service = createK8sService();
      await expect(
        service.listWorkflows(
          'k8s',
          'app=test',
          undefined,
          mockCredentials as any,
        ),
      ).rejects.toThrow("Cluster Kubernetes 'production' non trouvé");
    });

    it('throws when kubernetes plugin is not configured', async () => {
      const service = createService({
        argoWorkflows: {
          defaultInstance: 'k8s',
          instances: [
            { name: 'k8s', kubernetes: { clusterName: 'production' } },
          ],
        },
      });
      // No clusterSupplier/fetcher/authStrategy provided

      await expect(
        service.listWorkflows(
          'k8s',
          'app=test',
          undefined,
          mockCredentials as any,
        ),
      ).rejects.toThrow("plugin Kubernetes n'est pas configuré");
    });

    it('throws when credentials are not provided', async () => {
      const service = createK8sService();
      await expect(service.listWorkflows('k8s', 'app=test')).rejects.toThrow(
        'credentials Backstage sont requises',
      );
    });
  });
});
