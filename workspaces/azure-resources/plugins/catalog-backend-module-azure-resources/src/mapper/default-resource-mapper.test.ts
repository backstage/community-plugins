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

import { mapResource } from './default-resource-mapper';
import {
  storageAccountResource,
  virtualMachineResource,
  aksClusterResource,
  minimalResource,
  resourceWithSpecialTagKeys,
} from '../../__fixtures__/azure-resources';

describe('mapResource', () => {
  const providerId = 'test-provider';

  describe('Default Mapping (no custom config)', () => {
    it('should map a storage account with default configuration', () => {
      const result = mapResource(storageAccountResource, providerId);

      // Verify the result structure
      expect(result).toBeDefined();
      expect(result?.apiVersion).toBe('backstage.io/v1alpha1');
      expect(result?.kind).toBe('Resource');

      expect(result?.metadata.name).toBe('referencedatateststg');
      expect(
        result?.metadata?.annotations?.['management.azure.com/resourceId'],
      ).toBe(
        '/subscriptions/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/resourceGroups/reference-data-shared-rg/providers/Microsoft.Storage/storageAccounts/referencedatateststg',
      );
      expect(result?.spec?.type).toBe('microsoft.storage/storageaccounts');
    });

    it('should map a virtual machine with default configuration', () => {
      const result = mapResource(virtualMachineResource, providerId);

      expect(result).toBeDefined();
      expect(result?.apiVersion).toBe('backstage.io/v1alpha1');
      expect(result?.kind).toBe('Resource');
      expect(result?.spec).toBeDefined();
      expect(result?.metadata).toBeDefined();
      expect(result?.metadata.name).toBe('test-vm-instance');
      expect(
        result?.metadata?.annotations?.['management.azure.com/resourceId'],
      ).toBe(
        '/subscriptions/bbbbbbbb-cccc-dddd-eeee-ffffffffffff/resourceGroups/mltest-dbw-managed-rg-ancillary/providers/Microsoft.Compute/virtualMachines/test-vm-instance',
      );
      expect(result?.spec?.type).toBe('microsoft.compute/virtualmachines');
      expect(result?.spec?.owner).toBeUndefined();
    });

    it('should map an AKS cluster with default configuration', () => {
      const result = mapResource(aksClusterResource, providerId);

      expect(result).toBeDefined();
      expect(result?.apiVersion).toBe('backstage.io/v1alpha1');
      expect(result?.kind).toBe('Resource');
      expect(result?.spec).toBeDefined();
      expect(result?.metadata).toBeDefined();

      expect(result?.metadata.name).toBe('abc-reference-test-aks');
      expect(
        result?.metadata?.annotations?.['management.azure.com/resourceId'],
      ).toBe(
        '/subscriptions/cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa/resourceGroups/abc-aks-prod-rg/providers/Microsoft.ContainerService/managedClusters/abc-reference-test-aks',
      );
      expect(
        result?.metadata?.annotations?.['management.azure.com/subscriptionId'],
      ).toBe('cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa');
    });

    it('should handle minimal resource with only required fields', () => {
      const result = mapResource(minimalResource, providerId);

      expect(result).toBeDefined();
      expect(result?.metadata.name).toBe('minimal-resource');
      expect(result?.spec?.type).toBe('microsoft.storage/storageaccounts');
      expect(result?.spec?.owner).toBeUndefined();
    });
  });

  describe('Custom Mapping - Simple Paths', () => {
    it('should map simple top-level properties', () => {
      const mapping = {
        metadata: {
          title: 'name',
          annotations: {
            'azure.location': 'location',
          },
        },
        spec: {
          type: 'type',
        },
      };

      const result = mapResource(storageAccountResource, providerId, mapping);

      expect(result).toBeDefined();
      expect(result?.metadata.title).toBe(storageAccountResource.name);
      expect(result?.metadata?.annotations?.['azure.location']).toBe(
        storageAccountResource.location,
      );
      expect(result?.spec?.type).toBe(storageAccountResource.type);
    });
  });

  describe('Custom Mapping - Nested Paths', () => {
    it('should extract values from nested properties using dot notation', () => {
      const mapping = {
        metadata: {
          annotations: {
            'team-owner': 'tags.owner',
            environment: 'tags.environment',
            'provisioning-state': 'properties.provisioningState',
          },
        },
      };

      const result = mapResource(
        resourceWithSpecialTagKeys,
        providerId,
        mapping,
      );

      expect(result).toBeDefined();
      expect(result?.metadata?.annotations?.['provisioning-state']).toBe(
        resourceWithSpecialTagKeys.properties.provisioningState,
      );
      expect(result?.metadata?.annotations?.['team-owner']).toBe(
        resourceWithSpecialTagKeys.tags?.owner,
      );
      expect(result?.metadata?.annotations?.environment).toBe(
        resourceWithSpecialTagKeys.tags?.environment,
      );
    });

    it('should handle deep nested paths', () => {
      const mapping = {
        metadata: {
          annotations: {
            // TODO: Add mappings for deeply nested properties from real Azure resources
            // Example: 'sku-tier': 'sku.tier'
            // Example: 'network-profile': 'properties.networkProfile.networkInterfaces[0].id'
          },
        },
      };

      // TODO: Use complexNestedResource once populated
      const result = mapResource(storageAccountResource, providerId, mapping);

      expect(result).toBeDefined();
      // TODO: Add assertions
    });
  });

  describe('Custom Mapping - Bracket Notation', () => {
    it('should extract values with special characters in keys using bracket notation', () => {
      const mapping = {
        metadata: {
          annotations: {
            'app-name': `tags['app.kubernetes.io/name']`,
            'managed-by': `tags['backstage.io/managed-by']`,
          },
        },
        spec: {
          owner: `tags['catalog.owner']`,
        },
      };

      const result = mapResource(
        resourceWithSpecialTagKeys,
        providerId,
        mapping,
      );

      expect(result).toBeDefined();
      expect(result?.metadata.annotations?.['app-name']).toBeDefined();
      expect(result?.metadata.annotations?.['app-name']).toBe(
        resourceWithSpecialTagKeys.tags['app.kubernetes.io/name'],
      );
      expect(result?.metadata.annotations?.['managed-by']).toBeDefined();
      expect(result?.metadata.annotations?.['managed-by']).toBe(
        resourceWithSpecialTagKeys.tags['backstage.io/managed-by'],
      );
      expect(result?.spec?.owner).toBeDefined();
      expect(result?.spec?.owner).toBe(
        resourceWithSpecialTagKeys.tags['catalog.owner'],
      );
    });
  });

  describe('Annotations Merging', () => {
    it('should merge custom annotations with default annotations', () => {
      const mapping = {
        metadata: {
          annotations: {
            'custom-annotation': 'tags.environment',
          },
        },
      };

      const result = mapResource(
        resourceWithSpecialTagKeys,
        providerId,
        mapping,
      );

      expect(result).toBeDefined();
      // Should have both default and custom annotations
      expect(
        result?.metadata.annotations?.['management.azure.com/resourceId'],
      ).toBeDefined();
      expect(
        result?.metadata.annotations?.['management.azure.com/resourceId'],
      ).toBe(resourceWithSpecialTagKeys.id);
      expect(result?.metadata.annotations?.['custom-annotation']).toBe(
        'staging',
      );
    });

    it('should allow custom annotations to override default annotations', () => {
      const mapping = {
        metadata: {
          annotations: {
            'management.azure.com/resourceId': 'tags.environment', // Override default location annotation
          },
        },
      };

      const result = mapResource(
        resourceWithSpecialTagKeys,
        providerId,
        mapping,
      );

      expect(result).toBeDefined();
      expect(
        result?.metadata?.annotations?.['management.azure.com/resourceId'],
      ).toBeDefined();
      expect(
        result?.metadata?.annotations?.['management.azure.com/resourceId'],
      ).toBe(resourceWithSpecialTagKeys.tags.environment);
    });
  });

  describe('Edge Cases', () => {
    it('should return undefined for null resource', () => {
      const result = mapResource(null, providerId);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined resource', () => {
      const result = mapResource(undefined, providerId);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object resource', () => {
      const result = mapResource('not an object', providerId);
      expect(result).toBeUndefined();
    });

    it('should return undefined when required fields are missing', () => {
      const incompleteResource = {
        name: 'test',
        // missing id and type
      };

      const result = mapResource(incompleteResource, providerId);
      expect(result).toBeUndefined();
    });
    it('should allow allow missing field if there is a mapping for it', () => {
      const incompleteResource = {
        // missing id and type
        tags: {
          'test-tag': 'tag-value',
          'another-test-tag': 'another-tag-value',
          'one-more-tag': 'one-more-value',
        },
      };
      const mapping = {
        metadata: {
          name: 'tags.test-tag',
        },
        spec: {
          type: 'tags.another-test-tag',
        },
      };

      const result = mapResource(incompleteResource, providerId, mapping);
      expect(result).toBeDefined();
    });

    it('should handle mapping to non-existent paths gracefully', () => {
      const mapping = {
        metadata: {
          annotations: {
            'non-existent': 'this.path.does.not.exist',
            'another-missing': 'missing.field',
          },
        },
      };

      const result = mapResource(minimalResource, providerId, mapping);

      expect(result).toBeDefined();
      // Non-existent paths should not add annotations
      expect(result?.metadata.annotations?.['non-existent']).toBeUndefined();
      expect(result?.metadata.annotations?.['another-missing']).toBeUndefined();
      // But default annotations should still be there
      expect(
        result?.metadata.annotations?.['management.azure.com/resourceId'],
      ).toBeDefined();
    });

    it('should handle empty mapping configuration', () => {
      const result = mapResource(minimalResource, providerId, {});

      expect(result).toBeDefined();
      // Should behave like default mapping
      expect(result?.metadata.name).toBe('minimal-resource');
    });

    it('should handle mapping with empty nested objects', () => {
      const mapping = {
        metadata: {},
        spec: {},
      };

      const result = mapResource(minimalResource, providerId, mapping);

      expect(result).toBeDefined();
      expect(result?.metadata.name).toBe('minimal-resource');
    });

    it('should handle undefined values in tags', () => {
      const resourceWithUndefinedTags = {
        ...minimalResource,
        tags: {
          defined: 'value',
          undefined: undefined,
          null: null,
        },
      };

      const mapping = {
        metadata: {
          annotations: {
            'defined-tag': 'tags.defined',
            'undefined-tag': 'tags.undefined',
            'null-tag': 'tags.null',
          },
        },
      };

      const result = mapResource(
        resourceWithUndefinedTags,
        providerId,
        mapping,
      );

      expect(result).toBeDefined();
      expect(result?.metadata.annotations?.['defined-tag']).toBe('value');
      // Undefined and null should not be added
      expect(result?.metadata.annotations?.['undefined-tag']).toBeUndefined();
      expect(result?.metadata.annotations?.['null-tag']).toBeNull();
    });
  });

  describe('Default Owner Configuration', () => {
    it('should use default owner when resource has no owner tag', () => {
      const defaultOwner = 'team-platform';
      const result = mapResource(
        minimalResource,
        providerId,
        undefined,
        defaultOwner,
      );

      expect(result).toBeDefined();
      expect(result?.spec?.owner).toBe(defaultOwner);
    });

    it('should prefer backstage.io-owner tag over default owner', () => {
      const defaultOwner = 'team-platform';
      const resourceWithOwner = {
        ...minimalResource,
        tags: {
          'backstage.io-owner': 'team-specific',
        },
      };

      const result = mapResource(
        resourceWithOwner,
        providerId,
        undefined,
        defaultOwner,
      );

      expect(result).toBeDefined();
      expect(result?.spec?.owner).toBe('team-specific');
    });

    it('should handle undefined default owner', () => {
      const result = mapResource(
        minimalResource,
        providerId,
        undefined,
        undefined,
      );

      expect(result).toBeDefined();
      expect(result?.spec?.owner).toBeUndefined();
    });

    it('should allow custom mapping to override default owner', () => {
      const defaultOwner = 'team-platform';
      const resourceWithCustomOwner = {
        ...minimalResource,
        tags: {
          'custom-owner': 'team-custom',
        },
      };
      const mapping = {
        spec: {
          owner: 'tags.custom-owner',
        },
      };

      const result = mapResource(
        resourceWithCustomOwner,
        providerId,
        mapping,
        defaultOwner,
      );

      expect(result).toBeDefined();
      // Custom mapping should override default owner
      expect(result?.spec?.owner).toBe('team-custom');
    });
  });
});
