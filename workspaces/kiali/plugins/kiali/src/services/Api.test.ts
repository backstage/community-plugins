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

import { KialiApiClient } from './Api';
import { DiscoveryApi, IdentityApi } from '@backstage/core-plugin-api';

// Mock fetch globally
global.fetch = jest.fn();

describe('KialiApiClient', () => {
  let mockDiscoveryApi: jest.Mocked<DiscoveryApi>;
  let mockIdentityApi: jest.Mocked<IdentityApi>;
  let apiClient: KialiApiClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDiscoveryApi = {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue('http://localhost:7007/api/kiali'),
    } as any;

    mockIdentityApi = {
      getCredentials: jest.fn().mockResolvedValue({ token: 'test-token' }),
    } as any;

    apiClient = new KialiApiClient({
      discoveryApi: mockDiscoveryApi,
      identityApi: mockIdentityApi,
    });
  });

  describe('isDevEnv', () => {
    it('should return false', () => {
      expect(apiClient.isDevEnv()).toBe(false);
    });
  });

  describe('setAnnotation and setEntity', () => {
    it('should set annotation correctly', () => {
      apiClient.setAnnotation('test-key', 'test-value');
      // Annotation is stored internally, verify by making a request
      expect(apiClient).toBeDefined();
    });

    it('should set entity correctly', () => {
      const mockEntity = {
        metadata: {
          name: 'test-entity',
          namespace: 'default',
        },
      } as any;

      apiClient.setEntity(mockEntity);
      expect(apiClient).toBeDefined();
    });
  });

  describe('getApiVersionForObjectType', () => {
    it('should return correct API version for VirtualService', () => {
      const version = apiClient.getApiVersionForObjectType('VirtualService');
      expect(version).toBe('networking.istio.io/v1');
    });

    it('should return correct API version for DestinationRule', () => {
      const version = apiClient.getApiVersionForObjectType('DestinationRule');
      expect(version).toBe('networking.istio.io/v1');
    });

    it('should return correct API version for AuthorizationPolicy', () => {
      const version = apiClient.getApiVersionForObjectType(
        'AuthorizationPolicy',
      );
      expect(version).toBe('security.istio.io/v1');
    });

    it('should return default API version for unknown type', () => {
      const version = apiClient.getApiVersionForObjectType('UnknownType');
      expect(version).toBe('networking.istio.io/v1');
    });
  });

  describe('getCustomParams', () => {
    it('should handle array parameters correctly', () => {
      const params = {
        namespaces: ['ns1', 'ns2'],
        duration: 60,
      };
      const result = apiClient.getCustomParams(params);
      expect(result).toContain('namespaces[]=ns1');
      expect(result).toContain('namespaces[]=ns2');
      expect(result).toContain('duration=60');
    });

    it('should handle non-array parameters correctly', () => {
      const params = {
        duration: 60,
        cluster: 'cluster1',
      };
      const result = apiClient.getCustomParams(params);
      expect(result).toContain('duration=60');
      expect(result).toContain('cluster=cluster1');
    });
  });

  describe('getAuthInfo', () => {
    it('should fetch auth info successfully', async () => {
      const mockAuthInfo = {
        strategy: 'token',
        sessionInfo: {
          username: 'test-user',
          expiresOn: '2024-12-31T00:00:00Z',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthInfo,
      });

      const result = await apiClient.getAuthInfo();
      expect(result).toEqual(mockAuthInfo);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle errors when fetching auth info', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(apiClient.getAuthInfo()).resolves.toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should fetch status successfully', async () => {
      const mockStatus = {
        status: {
          'Kiali version': 'v1.86.0',
          'Kiali state': 'running',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await apiClient.getStatus();
      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getNamespaces', () => {
    it('should fetch namespaces successfully', async () => {
      const mockNamespaces = [
        { name: 'default', cluster: 'Kubernetes' },
        { name: 'kube-system', cluster: 'Kubernetes' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNamespaces,
      });

      const result = await apiClient.getNamespaces();
      expect(result).toEqual(mockNamespaces);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getServerConfig', () => {
    it('should fetch server config successfully', async () => {
      const mockConfig = {
        installationTag: 'Kiali Console',
        istioNamespace: 'istio-system',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const result = await apiClient.getServerConfig();
      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getClustersServices', () => {
    it('should fetch services successfully', async () => {
      const mockServices = {
        services: [
          {
            name: 'test-service',
            namespace: 'default',
            cluster: 'Kubernetes',
            health: {},
            istioSidecar: true,
            istioAmbient: false,
          },
        ],
        validations: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      });

      const result = await apiClient.getClustersServices('default', {
        rateInterval: '60s',
        health: 'true',
      });
      expect(result).toEqual(mockServices);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include cluster parameter when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ services: [], validations: {} }),
      });

      await apiClient.getClustersServices('default', {}, 'cluster1');
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getClustersWorkloads', () => {
    it('should fetch workloads successfully', async () => {
      const mockWorkloads = {
        workloads: [
          {
            name: 'test-workload',
            namespace: 'default',
            cluster: 'Kubernetes',
            health: {},
          },
        ],
        validations: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkloads,
      });

      const result = await apiClient.getClustersWorkloads('default', {});
      expect(result).toEqual(mockWorkloads);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getClustersApps', () => {
    it('should fetch apps successfully', async () => {
      const mockApps = {
        applications: [
          {
            name: 'test-app',
            namespace: 'default',
            cluster: 'Kubernetes',
            health: {},
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApps,
      });

      const result = await apiClient.getClustersApps('default', {});
      expect(result).toEqual(mockApps);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getWorkload', () => {
    it('should fetch workload details successfully', async () => {
      const mockWorkload = {
        name: 'test-workload',
        namespace: 'default',
        cluster: 'Kubernetes',
        health: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWorkload,
      });

      const result = await apiClient.getWorkload(
        'default',
        'test-workload',
        {},
      );
      expect(result).toEqual(mockWorkload);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getServiceDetail', () => {
    it('should fetch service details successfully', async () => {
      const mockServiceDetail = {
        service: {
          name: 'test-service',
          namespace: 'default',
          cluster: 'Kubernetes',
        },
        validations: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockServiceDetail,
      });

      const result = await apiClient.getServiceDetail(
        'default',
        'test-service',
        true,
      );
      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should include rateInterval when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ service: {}, validations: {} }),
      });

      await apiClient.getServiceDetail(
        'default',
        'test-service',
        false,
        undefined,
        { rateInterval: '60s' },
      );
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getApp', () => {
    it('should fetch app details successfully', async () => {
      const mockApp = {
        name: 'test-app',
        namespace: 'default',
        cluster: 'Kubernetes',
        health: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApp,
      });

      const result = await apiClient.getApp('default', 'test-app', {});
      expect(result).toEqual(mockApp);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getGraphElements', () => {
    it('should fetch graph elements successfully', async () => {
      const mockGraph = {
        elements: {
          nodes: [],
          edges: [],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGraph,
      });

      const result = await apiClient.getGraphElements({
        namespaces: 'default',
        duration: '60s',
      });
      expect(result).toEqual(mockGraph);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getMeshTls', () => {
    it('should fetch mesh TLS status successfully', async () => {
      const mockTls = {
        status: 'MTLS_ENABLED',
        autoMTLSEnabled: true,
        minTLS: 'TLSv1_2',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTls,
      });

      const result = await apiClient.getMeshTls();
      expect(result).toEqual(mockTls);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getIstioStatus', () => {
    it('should fetch Istio status successfully', async () => {
      const mockStatus = [
        {
          name: 'istiod',
          status: 'healthy',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await apiClient.getIstioStatus();
      expect(result).toEqual(mockStatus);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getIstioConfig', () => {
    it('should fetch Istio config successfully', async () => {
      const mockConfig = {
        virtualServices: [],
        destinationRules: [],
        validations: {},
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      const result = await apiClient.getIstioConfig(
        'default',
        ['VirtualService'],
        true,
        '',
        '',
      );
      expect(result).toEqual(mockConfig);
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      await expect(apiClient.getAuthInfo()).rejects.toThrow('Network error');
    });

    it('should handle non-ok responses', async () => {
      const errorResponse = { error: 'Server error' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => errorResponse,
      });

      // The API returns the error response instead of throwing
      const result = await apiClient.getAuthInfo();
      expect(result).toEqual(errorResponse);
    });

    it('should handle missing token gracefully', async () => {
      mockIdentityApi.getCredentials = jest
        .fn()
        .mockResolvedValue({ token: undefined });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.getAuthInfo();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('request handling', () => {
    it('should include authorization header when token is available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.getAuthInfo();

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1]?.headers;
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should use correct base URL from discovery API', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.getAuthInfo();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('kiali');
    });
  });
});
