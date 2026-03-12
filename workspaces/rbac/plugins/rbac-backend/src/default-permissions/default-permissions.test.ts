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
import { mockServices } from '@backstage/backend-test-utils';

import { EnforcerDelegate } from '../service/enforcer-delegate';
import {
  DefaultPermissionsReader,
  DefaultPermissionsSyncher,
  buildDefaultRoleMetadata,
} from './default-permissions';

describe('DefaultPermissionsReader', () => {
  describe('readRole', () => {
    it('returns undefined when no defaultPermissions config', () => {
      const config = mockServices.rootConfig({ data: {} });
      const reader = new DefaultPermissionsReader(config);
      expect(reader.readRole()).toBeUndefined();
    });

    it('throws when defaultRole is not set but defaultPermissions section exists', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {},
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(() => reader.readRole()).toThrow(
        'Default role is mandatory for defaultPermissions configuration. Please set a valid default role in the configuration.',
      );
    });

    it('returns role when defaultRole is set', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/catalog-reader',
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(reader.readRole()).toBe('role:default/catalog-reader');
    });

    it('throws when defaultRole is empty or missing in defaultPermissions section', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: '',
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      // Either config layer or readRole throws when defaultRole is empty/missing
      expect(() => reader.readRole()).toThrow();
    });
  });

  describe('readPolicies', () => {
    it('returns empty array when no defaultPermissions config', () => {
      const config = mockServices.rootConfig({ data: {} });
      const reader = new DefaultPermissionsReader(config);
      expect(reader.readPolicies()).toEqual([]);
    });

    it('throws when defaultRole is set but basicPermissions is missing', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/catalog-reader',
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(() => reader.readPolicies()).toThrow(
        "The default role 'role:default/catalog-reader' requires at least one entry in permission.rbac.defaultPermissions.basicPermissions.",
      );
    });

    it('throws when defaultRole is set but basicPermissions is empty array', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/catalog-reader',
                basicPermissions: [],
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(() => reader.readPolicies()).toThrow(
        "The default role 'role:default/catalog-reader' requires at least one entry in permission.rbac.defaultPermissions.basicPermissions.",
      );
    });

    it('returns policies with default action and effect', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/catalog-reader',
                basicPermissions: [
                  {
                    permission: 'catalog.entity.read',
                  },
                ],
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(reader.readPolicies()).toEqual([
        {
          entityReference: 'role:default/catalog-reader',
          permission: 'catalog.entity.read',
          policy: 'use',
          effect: 'allow',
        },
      ]);
    });

    it('returns policies with custom action (effect is always allow)', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/guest',
                basicPermissions: [
                  {
                    permission: 'catalog.entity.read',
                    action: 'read',
                  },
                  {
                    permission: 'catalog.entity.delete',
                    action: 'delete',
                  },
                ],
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(reader.readPolicies()).toEqual([
        {
          entityReference: 'role:default/guest',
          permission: 'catalog.entity.read',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/guest',
          permission: 'catalog.entity.delete',
          policy: 'delete',
          effect: 'allow',
        },
      ]);
    });

    it('throws when action is invalid', () => {
      const config = mockServices.rootConfig({
        data: {
          permission: {
            rbac: {
              defaultPermissions: {
                defaultRole: 'role:default/guest',
                basicPermissions: [
                  {
                    permission: 'catalog.entity.read',
                    action: 'invalid-action',
                  },
                ],
              },
            },
          },
        },
      });
      const reader = new DefaultPermissionsReader(config);
      expect(() => reader.readPolicies()).toThrow(
        "Invalid action 'invalid-action' for permission 'catalog.entity.read'.",
      );
    });
  });
});

describe('DefaultPermissionsSyncher', () => {
  function createRoleMetadataStorageMock() {
    return {
      getDefaultRole: jest.fn().mockResolvedValue(undefined),
      syncDefaultRoleMetadata: jest.fn().mockResolvedValue(undefined),
      removeRoleMetadata: jest.fn().mockResolvedValue(undefined),
      filterRoleMetadata: jest.fn(),
      filterForOwnerRoleMetadata: jest.fn(),
      findRoleMetadata: jest.fn(),
      createRoleMetadata: jest.fn(),
      updateRoleMetadata: jest.fn(),
      getCachedDefaultRoleMetadata: jest.fn(),
    };
  }

  function createEnforcerMock() {
    return {
      getFilteredPolicy: jest.fn().mockResolvedValue([]),
      removePolicies: jest.fn().mockResolvedValue(undefined),
      addPolicies: jest.fn().mockResolvedValue(undefined),
    };
  }

  it('returns early when no roleEntityRef and no previous default role', async () => {
    const config = mockServices.rootConfig({ data: {} });
    const reader = new DefaultPermissionsReader(config);
    const storage = createRoleMetadataStorageMock();
    const enforcer = createEnforcerMock();

    const syncher = new DefaultPermissionsSyncher(
      storage,
      enforcer as unknown as EnforcerDelegate,
      reader,
    );
    await syncher.sync();

    expect(storage.getDefaultRole).toHaveBeenCalled();
    expect(storage.syncDefaultRoleMetadata).not.toHaveBeenCalled();
    expect(storage.removeRoleMetadata).not.toHaveBeenCalled();
    expect(enforcer.getFilteredPolicy).not.toHaveBeenCalled();
  });

  it('removes previous default role when no roleEntityRef but prevDefRole exists', async () => {
    const config = mockServices.rootConfig({ data: {} });
    const reader = new DefaultPermissionsReader(config);
    const storage = createRoleMetadataStorageMock();
    storage.getDefaultRole.mockResolvedValue({
      roleEntityRef: 'role:default/old-default',
      source: 'configuration',
      modifiedBy: 'config',
    });
    const enforcer = createEnforcerMock();
    enforcer.getFilteredPolicy.mockResolvedValue([
      ['role:default/old-default', 'catalog.entity.read', 'read', 'allow'],
    ]);

    const syncher = new DefaultPermissionsSyncher(
      storage,
      enforcer as unknown as EnforcerDelegate,
      reader,
    );
    await syncher.sync();

    expect(enforcer.removePolicies).toHaveBeenCalledWith([
      ['role:default/old-default', 'catalog.entity.read', 'read', 'allow'],
    ]);
    expect(storage.removeRoleMetadata).toHaveBeenCalledWith(
      'role:default/old-default',
    );
    expect(storage.syncDefaultRoleMetadata).not.toHaveBeenCalled();
  });

  it('syncs metadata and policies when roleEntityRef is set and no prevDefRole', async () => {
    const config = mockServices.rootConfig({
      data: {
        permission: {
          rbac: {
            defaultPermissions: {
              defaultRole: 'role:default/catalog-reader',
              basicPermissions: [
                { permission: 'catalog.entity.read', action: 'read' },
              ],
            },
          },
        },
      },
    });
    const reader = new DefaultPermissionsReader(config);
    const storage = createRoleMetadataStorageMock();
    const enforcer = createEnforcerMock();

    const syncher = new DefaultPermissionsSyncher(
      storage,
      enforcer as unknown as EnforcerDelegate,
      reader,
    );
    await syncher.sync();

    expect(storage.syncDefaultRoleMetadata).toHaveBeenCalledWith(
      'role:default/catalog-reader',
    );
    expect(enforcer.getFilteredPolicy).toHaveBeenCalled();
    expect(enforcer.addPolicies).toHaveBeenCalled();
  });

  it('throws when prevDefRole has incompatible source', async () => {
    const config = mockServices.rootConfig({ data: {} });
    const reader = new DefaultPermissionsReader(config);
    const storage = createRoleMetadataStorageMock();
    storage.getDefaultRole.mockResolvedValue({
      roleEntityRef: 'role:default/csv-role',
      source: 'csv-file',
      modifiedBy: 'file',
    });
    const enforcer = createEnforcerMock();

    const syncher = new DefaultPermissionsSyncher(
      storage,
      enforcer as unknown as EnforcerDelegate,
      reader,
    );
    await expect(syncher.sync()).rejects.toThrow(
      'Detected previous default role with incompatible source:',
    );
  });
});

describe('buildDefaultRoleMetadata', () => {
  it('returns RoleMetadataDao with all required fields', () => {
    const roleRef = 'role:default/catalog-reader';
    const meta = buildDefaultRoleMetadata(roleRef);

    expect(meta.roleEntityRef).toBe(roleRef);
    expect(meta.author).toBe('application configuration');
    expect(meta.source).toBe('configuration');
    expect(meta.isDefault).toBe(true);
    expect(meta.description).toBe(
      'Role with default permissions for all users and groups.',
    );
    expect(meta.modifiedBy).toBe('application configuration');
    expect(meta.lastModified).toBeDefined();
    expect(meta.createdAt).toBeDefined();
    expect(typeof meta.lastModified).toBe('string');
    expect(typeof meta.createdAt).toBe('string');
  });
});
