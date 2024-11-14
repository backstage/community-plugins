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
import { ADMIN_ROLE_AUTHOR } from './admin-permissions/admin-creation';
import { RoleMetadataDao } from './database/role-metadata';
import {
  deepSortedEqual,
  isPermissionAction,
  mergeRoleMetadata,
  metadataStringToPolicy,
  policiesToString,
  policyToString,
  removeTheDifference,
  transformArrayToPolicy,
  transformPolicyGroupToLowercase,
  transformRolesGroupToLowercase,
  typedPoliciesToString,
  typedPolicyToString,
} from './helper';
// Import the function to test
import { EnforcerDelegate } from './service/enforcer-delegate';

const modifiedBy = 'user:default/some-user';

const auditLoggerMock = {
  getActorId: jest.fn().mockImplementation(),
  createAuditLogDetails: jest.fn().mockImplementation(),
  auditLog: jest.fn().mockImplementation(),
};

describe('helper.ts', () => {
  describe('policyToString', () => {
    it('should convert permission policy to string', () => {
      const policy = [
        'user:default/some-user',
        'catalog-entity',
        'read',
        'allow',
      ];
      const expectedString =
        '[user:default/some-user, catalog-entity, read, allow]';
      expect(policyToString(policy)).toEqual(expectedString);
    });
  });

  describe('typedPolicyToString', () => {
    it('should convert permission policy to string', () => {
      const policy = [
        'user:default/some-user',
        'catalog-entity',
        'read',
        'allow',
      ];
      const type = 'p';
      const expectedString =
        'p, user:default/some-user, catalog-entity, read, allow';
      expect(typedPolicyToString(policy, type)).toEqual(expectedString);
    });
  });

  describe('policiesToString', () => {
    it('should convert one permission policy to string', () => {
      const policies = [
        ['user:default/some-user', 'catalog-entity', 'read', 'allow'],
      ];
      const expectedString =
        '[[user:default/some-user, catalog-entity, read, allow]]';
      expect(policiesToString(policies)).toEqual(expectedString);
    });

    it('should convert empty permission policy array to string', () => {
      const policies = [[]];
      const expectedString = '[[]]';
      expect(policiesToString(policies)).toEqual(expectedString);
    });
  });

  describe('typedPoliciesToString', () => {
    it('should convert one permission policy to string', () => {
      const policies = [
        ['user:default/some-user', 'catalog-entity', 'read', 'allow'],
      ];
      const type = 'p';
      const expectedString = `\n    p, user:default/some-user, catalog-entity, read, allow\n  `;

      expect(typedPoliciesToString(policies, type)).toEqual(expectedString);
    });

    it('should convert empty permission policy array to string', () => {
      const policies = [[]];
      const expectedString = `\n    \n  `;
      const type = 'p';
      expect(typedPoliciesToString(policies, type)).toEqual(expectedString);
    });
  });

  describe('metadataStringToPolicy', () => {
    it('parses a permission policy string', () => {
      const policy = '[user:default/some-user, catalog-entity, read, allow]';
      const expectedPolicy = [
        'user:default/some-user',
        'catalog-entity',
        'read',
        'allow',
      ];
      expect(metadataStringToPolicy(policy)).toEqual(expectedPolicy);
    });

    it('parses a grouping policy', () => {
      const policy = '[user:default/some-user, role:default/dev]';
      const expectedPolicy = ['user:default/some-user', 'role:default/dev'];
      expect(metadataStringToPolicy(policy)).toEqual(expectedPolicy);
    });
  });

  describe('transformPolicyGroupToLowercase', () => {
    it.each([
      [
        ['g', 'user:default/TOM', 'role:default/CATALOG-USER'],
        ['g', 'user:default/tom', 'role:default/CATALOG-USER'],
      ],
      [
        ['g', 'group:default/Developers', 'role:default/CATALOG-USER'],
        ['g', 'group:default/developers', 'role:default/CATALOG-USER'],
      ],
    ])('should convert group in %s to lowercase', (input, expected) => {
      transformPolicyGroupToLowercase(input);
      expect(input).toEqual(expected);
    });

    it('should not transform policy to lowercase', () => {
      const policyArray = [
        'p',
        'role:default/CATALOG-USER',
        'catalog-entity',
        'read',
        'allow',
      ];
      const expected = [...policyArray];
      transformPolicyGroupToLowercase(policyArray);
      expect(policyArray).toEqual(expected);
    });

    it('should handle invalid input', () => {
      const policyArray = ['g'];
      transformPolicyGroupToLowercase(policyArray);
      expect(policyArray).toEqual(['g']);
    });
  });

  describe('transformRolesGroupToLowercase', () => {
    it('should convert users and groups in roles to lowercase', () => {
      const roles = [
        ['user:default/test', 'role:default/test-provider'],
        ['group:default/Developers', 'role:default/Reader'],
      ];
      const expectedRoles = [
        ['user:default/test', 'role:default/test-provider'],
        ['group:default/developers', 'role:default/Reader'],
      ];
      expect(transformRolesGroupToLowercase(roles)).toEqual(expectedRoles);
    });

    it.each([[[['user:default/test']]], [[[]]]])(
      'should handle invalid input %d',
      input => {
        const result = transformRolesGroupToLowercase(input);
        expect(result).toEqual(input);
      },
    );
  });

  describe('removeTheDifference', () => {
    const mockEnforcerDelegate: Partial<EnforcerDelegate> = {
      removeGroupingPolicies: jest.fn().mockImplementation(),
      getFilteredGroupingPolicy: jest.fn().mockReturnValue([]),
    };

    beforeEach(() => {
      (mockEnforcerDelegate.removeGroupingPolicies as jest.Mock).mockClear();
      auditLoggerMock.auditLog.mockReset();
    });

    it('removes the difference between originalGroup and addedGroup', async () => {
      const originalGroup = [
        'user:default/some-user',
        'user:default/dev',
        'user:default/admin',
      ];
      const addedGroup = ['user:default/some-user', 'user:default/dev'];
      const source = 'rest';
      const roleName = 'role:default/admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
        auditLoggerMock,
        ADMIN_ROLE_AUTHOR,
      );

      expect(mockEnforcerDelegate.removeGroupingPolicies).toHaveBeenCalledWith(
        [['user:default/admin', roleName]],
        {
          modifiedBy: ADMIN_ROLE_AUTHOR,
          roleEntityRef: 'role:default/admin',
          source: 'rest',
        },
        false,
      );
    });

    it('does nothing when originalGroup and addedGroup are the same', async () => {
      const originalGroup = ['user:default/some-user', 'user:default/dev'];
      const addedGroup = ['user:default/some-user', 'user:default/dev'];
      const source = 'rest';
      const roleName = 'role:default/admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
        auditLoggerMock,
        ADMIN_ROLE_AUTHOR,
      );

      expect(
        mockEnforcerDelegate.removeGroupingPolicies,
      ).not.toHaveBeenCalled();
    });

    it('does nothing when originalGroup is empty', async () => {
      const originalGroup: string[] = [];
      const addedGroup = ['user:default/some-user', 'role:default/dev'];
      const source = 'rest';
      const roleName = 'admin';

      await removeTheDifference(
        originalGroup,
        addedGroup,
        source,
        roleName,
        mockEnforcerDelegate as EnforcerDelegate,
        auditLoggerMock,
        ADMIN_ROLE_AUTHOR,
      );

      expect(
        mockEnforcerDelegate.removeGroupingPolicies,
      ).not.toHaveBeenCalled();
    });
  });

  describe('transformArrayToPolicy', () => {
    it('transforms array to RoleBasedPolicy object', () => {
      const policyArray = [
        'role:default/dev',
        'catalog-entity',
        'read',
        'allow',
      ];
      const expectedPolicy = {
        entityReference: 'role:default/dev',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      };

      const result = transformArrayToPolicy(policyArray);

      expect(result).toEqual(expectedPolicy);
    });
  });

  describe('deepSortedEqual', () => {
    it('should return true for identical objects with nested properties in different order', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa team',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        roleEntityRef: 'role:default/qa',
        description: 'qa team',
        id: 1,
        source: 'rest',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(true);
    });

    it('should return true for identical objects with different ordering of top-level properties', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa team',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        id: 1,
        description: 'qa team',
        source: 'rest',
        roleEntityRef: 'role:default/qa',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(true);
    });

    it('should return true for identical objects with different ordering of top-level properties with exclude read only fields', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa team',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        // read only properties
        author: 'role:default/some-role',
        modifiedBy: 'role:default/some-role',
        createdAt: '2024-02-26 12:25:31+00',
        lastModified: '2024-02-26 12:25:31+00',
      };
      const obj2: RoleMetadataDao = {
        id: 1,
        description: 'qa team',
        source: 'rest',
        roleEntityRef: 'role:default/qa',
        modifiedBy,
      };
      expect(
        deepSortedEqual(obj1, obj2, [
          'author',
          'modifiedBy',
          'createdAt',
          'lastModified',
        ]),
      ).toBe(true);
    });

    it('should return false for objects with different values', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        description: 'great qa',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different source', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'configuration',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different id', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 2,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });

    it('should return false for objects with different role entity reference', () => {
      const obj1: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/qa',
        source: 'rest',
        modifiedBy,
      };
      const obj2: RoleMetadataDao = {
        description: 'qa teams',
        id: 1,
        roleEntityRef: 'role:default/dev',
        source: 'rest',
        modifiedBy,
      };
      expect(deepSortedEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('isPermissionAction', () => {
    it('should return true', () => {
      let result = isPermissionAction('create');
      expect(result).toBeTruthy();

      result = isPermissionAction('read');
      expect(result).toBeTruthy();

      result = isPermissionAction('update');
      expect(result).toBeTruthy();

      result = isPermissionAction('delete');
      expect(result).toBeTruthy();

      result = isPermissionAction('use');
      expect(result).toBeTruthy();
    });

    it('should return false', () => {
      const result = isPermissionAction('unknown');
      expect(result).toBeFalsy();
    });
  });
});

describe('mergeRoleMetadata', () => {
  it('should merge new metadata into current metadata', () => {
    const currentMetadata: RoleMetadataDao = {
      lastModified: '2021-01-01T00:00:00Z',
      modifiedBy: 'user:default/user1',
      description: 'Initial role description',
      roleEntityRef: 'user:default/tim',
      source: 'legacy',
    };

    const newMetadata: RoleMetadataDao = {
      lastModified: '2022-01-01T00:00:00Z',
      modifiedBy: 'user:default/user2',
      description: 'Updated role description',
      roleEntityRef: 'user:default/dev-team',
      source: 'rest',
    };

    const expectedMergedMetadata: RoleMetadataDao = {
      ...currentMetadata,
      ...newMetadata,
    };

    const result = mergeRoleMetadata(currentMetadata, newMetadata);

    expect(result).toEqual(expectedMergedMetadata);
  });

  it('should use current metadata description if new metadata description is undefined', () => {
    const currentMetadata: RoleMetadataDao = {
      lastModified: '2021-01-01T00:00:00Z',
      modifiedBy: 'user:default/user1',
      description: 'Initial role description',
      roleEntityRef: 'user:default/tim',
      source: 'legacy',
    };

    const newMetadata: RoleMetadataDao = {
      lastModified: '2022-01-01T00:00:00Z',
      modifiedBy: 'user:default/user2',
      roleEntityRef: 'user:default/dev-team',
      source: 'csv-file',
    };

    const expectedMergedMetadata: RoleMetadataDao = {
      ...currentMetadata,
      ...newMetadata,
      description: currentMetadata.description,
    };

    const result = mergeRoleMetadata(currentMetadata, newMetadata);

    expect(result).toEqual(expectedMergedMetadata);
  });

  it('should use current date if new metadata lastModified is undefined', () => {
    const currentMetadata: RoleMetadataDao = {
      lastModified: '2021-01-01T00:00:00Z',
      modifiedBy: 'user:default/user1',
      description: 'Initial role description',
      roleEntityRef: 'user:default/tim',
      source: 'legacy',
    };

    const newMetadata: RoleMetadataDao = {
      modifiedBy: 'user:default/user2',
      description: 'Updated role description',
      roleEntityRef: 'user:default/dev-team',
      source: 'configuration',
    };

    const result = mergeRoleMetadata(currentMetadata, newMetadata);
    const resultDate = new Date(result.lastModified!);
    expect(resultDate).toBeInstanceOf(Date);
    expect(result.modifiedBy).toEqual(newMetadata.modifiedBy);
    expect(result.description).toEqual(newMetadata.description);
    expect(result.roleEntityRef).toEqual(newMetadata.roleEntityRef);
    expect(result.source).toEqual(newMetadata.source);
  });

  it('should not modify original metadata objects', () => {
    const currentMetadata: RoleMetadataDao = {
      lastModified: '2021-01-01T00:00:00Z',
      modifiedBy: 'user:default/user1',
      description: 'Initial role description',
      roleEntityRef: 'user:default/tim',
      source: 'legacy',
    };

    const newMetadata: RoleMetadataDao = {
      lastModified: '2022-01-01T00:00:00Z',
      modifiedBy: 'user:default/user2',
      description: 'Updated role description',
      roleEntityRef: 'user:default/dev-team',
      source: 'configuration',
    };

    const currentMetadataClone = { ...currentMetadata };
    const newMetadataClone = { ...newMetadata };

    mergeRoleMetadata(currentMetadata, newMetadata);

    expect(currentMetadata).toEqual(currentMetadataClone);
    expect(newMetadata).toEqual(newMetadataClone);
  });

  it('should use current date if new metadata createdAt is undefined', () => {
    const currentMetadata: RoleMetadataDao = {
      createdAt: '2021-01-01T00:00:00Z',
      lastModified: '2021-01-01T00:00:00Z',
      modifiedBy: 'user:default/user1',
      description: 'Initial role description',
      roleEntityRef: 'user:default/tim',
      source: 'legacy',
    };

    const newMetadata: RoleMetadataDao = {
      lastModified: '2022-01-01T00:00:00Z',
      modifiedBy: 'user:default/user2',
      description: 'Updated role description',
      roleEntityRef: 'user:default/dev-team',
      source: 'configuration',
    };

    const result = mergeRoleMetadata(currentMetadata, newMetadata);
    const resultDate = new Date(result.createdAt!);
    expect(resultDate).toBeInstanceOf(Date);
    expect(result.lastModified).toEqual(newMetadata.lastModified);
    expect(result.modifiedBy).toEqual(newMetadata.modifiedBy);
    expect(result.description).toEqual(newMetadata.description);
    expect(result.roleEntityRef).toEqual(newMetadata.roleEntityRef);
    expect(result.source).toEqual(newMetadata.source);
  });
});
