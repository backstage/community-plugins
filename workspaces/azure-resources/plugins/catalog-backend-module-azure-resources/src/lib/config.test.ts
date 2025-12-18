/*
 * Copyright 2025 The Backstage Authors
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
import { readProviderConfig, readProviderConfigs } from './config';

describe('readProviderConfig', () => {
  describe('required fields validation', () => {
    it('should successfully read all required fields', () => {
      const config = new ConfigReader({
        id: 'storage-accounts',
        query: `Resources | where type =~ 'microsoft.storage/storageaccounts'`,
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      const result = readProviderConfig(config);

      expect(result).toEqual({
        id: 'storage-accounts',
        query: `Resources | where type =~ 'microsoft.storage/storageaccounts'`,
        scope: {
          subscriptions: ['sub-1'],
          managementGroups: undefined,
        },
        schedule: undefined,
        mapping: undefined,
      });
    });

    it('should throw error when id is missing', () => {
      const config = new ConfigReader({
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      expect(() => readProviderConfig(config)).toThrow();
    });

    it('should throw error when query is missing', () => {
      const config = new ConfigReader({
        id: 'storage-accounts',
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      expect(() => readProviderConfig(config)).toThrow();
    });
  });

  describe('scope validation', () => {
    it('should throw error when neither managementGroups nor subscriptions is specified', () => {
      const config = new ConfigReader({
        id: 'storage-accounts',
        query: 'Resources',
      });

      expect(() => readProviderConfig(config)).toThrow(
        "At least one of 'scope.managementGroups' or 'scope.subscriptions' must be specified for provider 'storage-accounts'",
      );
    });

    it('should throw error when scope is empty object', () => {
      const config = new ConfigReader({
        id: 'storage-accounts',
        query: 'Resources',
        scope: {},
      });

      expect(() => readProviderConfig(config)).toThrow(
        "At least one of 'scope.managementGroups' or 'scope.subscriptions' must be specified for provider 'storage-accounts'",
      );
    });

    it('should successfully read scope with only subscriptions', () => {
      const config = new ConfigReader({
        id: 'vms-multi-sub',
        query: `Resources | where type =~ 'microsoft.compute/virtualmachines'`,
        scope: {
          subscriptions: ['sub-1', 'sub-2', 'sub-3'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.scope).toEqual({
        subscriptions: ['sub-1', 'sub-2', 'sub-3'],
        managementGroups: undefined,
      });
    });

    it('should successfully read scope with only managementGroups', () => {
      const config = new ConfigReader({
        id: 'aks-clusters',
        query: `Resources | where type =~ 'microsoft.containerservice/managedclusters'`,
        scope: {
          managementGroups: ['mg-production', 'mg-staging'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.scope).toEqual({
        managementGroups: ['mg-production', 'mg-staging'],
        subscriptions: undefined,
      });
    });

    it('should successfully read scope with both subscriptions and managementGroups', () => {
      const config = new ConfigReader({
        id: 'all-resources',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1', 'sub-2'],
          managementGroups: ['mg-prod'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.scope).toEqual({
        subscriptions: ['sub-1', 'sub-2'],
        managementGroups: ['mg-prod'],
      });
    });

    it('should handle single subscription', () => {
      const config = new ConfigReader({
        id: 'single-sub',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-only'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.scope).toEqual({
        subscriptions: ['sub-only'],
        managementGroups: undefined,
      });
    });

    it('should handle single management group', () => {
      const config = new ConfigReader({
        id: 'single-mg',
        query: 'Resources',
        scope: {
          managementGroups: ['mg-only'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.scope).toEqual({
        managementGroups: ['mg-only'],
        subscriptions: undefined,
      });
    });
  });

  describe('schedule configuration', () => {
    it('should handle missing schedule', () => {
      const config = new ConfigReader({
        id: 'no-schedule',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.schedule).toBeUndefined();
    });

    it('should throw error when schedule has frequency but missing timeout', () => {
      const config = new ConfigReader({
        id: 'scheduled',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        schedule: {
          frequency: { hours: 2 },
        },
      });

      expect(() => readProviderConfig(config)).toThrow();
    });

    it('should successfully read schedule with frequency and timeout', () => {
      const config = new ConfigReader({
        id: 'scheduled',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        schedule: {
          frequency: { hours: 2 },
          timeout: { minutes: 30 },
        },
      });

      const result = readProviderConfig(config);

      expect(result.schedule).toBeDefined();
      expect(result.schedule?.frequency).toEqual({ hours: 2 });
      expect(result.schedule?.timeout).toEqual({ minutes: 30 });
    });

    it('should successfully read schedule with all properties', () => {
      const config = new ConfigReader({
        id: 'scheduled-full',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        schedule: {
          frequency: { hours: 1 },
          timeout: { minutes: 50 },
          initialDelay: { seconds: 15 },
        },
      });

      const result = readProviderConfig(config);

      expect(result.schedule).toBeDefined();
      expect(result.schedule?.frequency).toEqual({ hours: 1 });
      expect(result.schedule?.timeout).toEqual({ minutes: 50 });
      expect(result.schedule?.initialDelay).toEqual({ seconds: 15 });
    });

    it('should handle schedule with different time units', () => {
      const config = new ConfigReader({
        id: 'scheduled-minutes',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        schedule: {
          frequency: { minutes: 30 },
          timeout: { minutes: 5 },
        },
      });

      const result = readProviderConfig(config);

      expect(result.schedule?.frequency).toEqual({ minutes: 30 });
      expect(result.schedule?.timeout).toEqual({ minutes: 5 });
    });
  });

  describe('mapping configuration', () => {
    it('should handle missing mapping', () => {
      const config = new ConfigReader({
        id: 'no-mapping',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      const result = readProviderConfig(config);

      expect(result.mapping).toBeUndefined();
    });

    it('should successfully read mapping configuration', () => {
      const config = new ConfigReader({
        id: 'with-mapping',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        mapping: {
          metadata: {
            name: 'name',
            title: 'properties.displayName',
          },
        },
      });

      const result = readProviderConfig(config);

      expect(result.mapping).toEqual({
        metadata: {
          name: 'name',
          title: 'properties.displayName',
        },
      });
    });

    it('should handle nested mapping paths', () => {
      const config = new ConfigReader({
        id: 'nested-mapping',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        mapping: {
          metadata: {
            annotations: {
              'my-annotation': 'tags.myAnnotation',
            },
          },
          spec: {
            owner: "tags['catalog.owner']",
          },
        },
      });

      const result = readProviderConfig(config);

      expect(result.mapping).toEqual({
        metadata: {
          annotations: {
            'my-annotation': 'tags.myAnnotation',
          },
        },
        spec: {
          owner: "tags['catalog.owner']",
        },
      });
    });

    it('should handle empty mapping object', () => {
      const config = new ConfigReader({
        id: 'empty-mapping',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        mapping: {},
      });

      const result = readProviderConfig(config);

      expect(result.mapping).toEqual({});
    });

    it('should handle complex mapping with multiple levels', () => {
      const config = new ConfigReader({
        id: 'complex-mapping',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
        mapping: {
          metadata: {
            name: 'name',
            namespace: 'tags.namespace',
            labels: {
              environment: 'tags.environment',
              team: 'tags.team',
            },
            annotations: {
              description: 'properties.description',
            },
          },
          spec: {
            type: 'type',
            lifecycle: 'tags.lifecycle',
            owner: 'tags.owner',
          },
        },
      });

      const result = readProviderConfig(config);

      expect(result.mapping).toEqual({
        metadata: {
          name: 'name',
          namespace: 'tags.namespace',
          labels: {
            environment: 'tags.environment',
            team: 'tags.team',
          },
          annotations: {
            description: 'properties.description',
          },
        },
        spec: {
          type: 'type',
          lifecycle: 'tags.lifecycle',
          owner: 'tags.owner',
        },
      });
    });
  });

  describe('complete configuration', () => {
    it('should successfully read complete configuration with all optional fields', () => {
      const config = new ConfigReader({
        id: 'complete-config',
        query: `Resources | where type =~ 'microsoft.containerservice/managedclusters'`,
        scope: {
          subscriptions: ['sub-1', 'sub-2'],
          managementGroups: ['mg-prod'],
        },
        schedule: {
          frequency: { hours: 2 },
          timeout: { minutes: 30 },
          initialDelay: { seconds: 15 },
        },
        mapping: {
          metadata: {
            name: 'name',
            annotations: {
              'azure/resource-id': 'id',
            },
          },
          spec: {
            owner: 'tags.owner',
          },
        },
      });

      const result = readProviderConfig(config);

      expect(result).toEqual({
        id: 'complete-config',
        query: `Resources | where type =~ 'microsoft.containerservice/managedclusters'`,
        scope: {
          subscriptions: ['sub-1', 'sub-2'],
          managementGroups: ['mg-prod'],
        },
        schedule: {
          frequency: { hours: 2 },
          timeout: { minutes: 30 },
          initialDelay: { seconds: 15 },
        },
        mapping: {
          metadata: {
            name: 'name',
            annotations: {
              'azure/resource-id': 'id',
            },
          },
          spec: {
            owner: 'tags.owner',
          },
        },
      });
    });

    it('should successfully read minimal valid configuration', () => {
      const config = new ConfigReader({
        id: 'minimal',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
        },
      });

      const result = readProviderConfig(config);

      expect(result).toEqual({
        id: 'minimal',
        query: 'Resources',
        scope: {
          subscriptions: ['sub-1'],
          managementGroups: undefined,
        },
        schedule: undefined,
        mapping: undefined,
      });
    });
  });
});

describe('readProviderConfigs', () => {
  describe('basic functionality', () => {
    it('should return undefined when no azureResources are configured', () => {
      const config = new ConfigReader({
        catalog: {
          providers: {},
        },
      });

      const result = readProviderConfigs(config);

      expect(result).toBeUndefined();
    });

    it('should return array of Config objects when single provider exists', () => {
      const config = new ConfigReader({
        catalog: {
          providers: {
            azureResources: [
              {
                id: 'storage-accounts',
                query: `Resources | where type =~ 'microsoft.storage/storageaccounts'`,
                scope: {
                  subscriptions: ['sub-1'],
                },
              },
            ],
          },
        },
      });

      const result = readProviderConfigs(config);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result![0]).toBeDefined();
      // Verify it's a Config object, not a parsed config
      expect(typeof result![0].getString).toBe('function');
    });

    it('should return array of Config objects when multiple providers exist', () => {
      const config = new ConfigReader({
        catalog: {
          providers: {
            azureResources: [
              {
                id: 'storage-accounts',
                query: `Resources | where type =~ 'microsoft.storage/storageaccounts'`,
                scope: {
                  subscriptions: ['sub-1'],
                },
              },
              {
                id: 'virtual-machines',
                query: `Resources | where type =~ 'microsoft.compute/virtualmachines'`,
                scope: {
                  managementGroups: ['mg-prod'],
                },
              },
            ],
          },
        },
      });

      const result = readProviderConfigs(config);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result![0].getString('id')).toBe('storage-accounts');
      expect(result![1].getString('id')).toBe('virtual-machines');
    });
  });

  describe('edge cases', () => {
    it('should handle empty azureResources array', () => {
      const config = new ConfigReader({
        catalog: {
          providers: {
            azureResources: [],
          },
        },
      });

      const result = readProviderConfigs(config);

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
