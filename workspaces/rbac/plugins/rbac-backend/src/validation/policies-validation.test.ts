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
import type {
  RoleBasedPolicy,
  Source,
} from '@backstage-community/plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';
import {
  validateEntityReference,
  validateGroupingPolicy,
  validatePolicy,
  validateRole,
  validateSource,
} from './policies-validation';

const modifiedBy = 'user:default/some-admin';

describe('rest data validation', () => {
  describe('validate entity referenced policy', () => {
    it('should return an error when entity reference is empty', () => {
      const policy: RoleBasedPolicy = {};
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'entityReference' must not be empty`);
    });

    it('should return an error when permission is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'permission' field must not be empty`);
    });

    it('should return an error when policy is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'policy' field must not be empty`);
    });

    it('should return an error when policy has an invalid value', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'invalid-policy',
        effect: 'allow',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `'policy' has invalid value: 'invalid-policy'. It should be one of: create, read, update, delete, use`,
      );
    });

    it('should return an error when effect is empty', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'effect' field must not be empty`);
    });

    it('should return an error when effect has an invalid value', () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'invalid-effect',
      };
      const err = validatePolicy(policy);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `'effect' has invalid value: 'invalid-effect'. It should be: 'allow' or 'deny'`,
      );
    });

    it(`pass validation when all fields are valid. Effect 'allow' should be valid`, () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      };
      const err = validatePolicy(policy);
      expect(err).toBeUndefined();
    });

    it(`pass validation when all fields are valid. Effect 'deny' should be valid`, () => {
      const policy: RoleBasedPolicy = {
        entityReference: 'user:default/guest',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'deny',
      };
      const err = validatePolicy(policy);
      expect(err).toBeUndefined();
    });
  });

  describe('validate entity reference', () => {
    it('should return an error when entity reference is an empty', () => {
      const err = validateEntityReference('');
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`'entityReference' must not be empty`);
    });

    it('should return an error when entity reference is not full or invalid', () => {
      const invalidOrUnsupportedEntityRefs = [
        {
          ref: 'admin',
          expectedError: `Entity reference "admin" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: 'admin:default',
          expectedError: `entity reference 'admin:default' does not match the required format [<kind>:][<namespace>/]<name>. Provide, please, full entity reference.`,
        },
        {
          ref: 'admin/guest',
          expectedError: `Entity reference "admin/guest" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: 'admin/guest/somewhere',
          expectedError: `Entity reference "admin/guest/somewhere" had missing or empty kind (e.g. did not start with "component:" or similar)`,
        },
        {
          ref: ':default/admin',
          expectedError: `Entity reference ":default/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:/admin',
          expectedError: `Entity reference "user:/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:default/',
          expectedError: `Entity reference "user:default/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:/',
          expectedError: `Entity reference "user:/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':default/',
          expectedError: `Entity reference ":default/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':/guest',
          expectedError: `Entity reference ":/guest" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':/',
          expectedError: `Entity reference ":/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: '/admin',
          expectedError: `Entity reference "/admin" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user/',
          expectedError: `Entity reference "user/" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: ':default',
          expectedError: `Entity reference ":default" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'user:',
          expectedError: `Entity reference "user:" was not on the form [<kind>:][<namespace>/]<name>`,
        },
        {
          ref: 'admin:default/test',
          expectedError: `Unsupported kind admin. List supported values ["user", "group", "role"]`,
        },
      ];
      for (const entityRef of invalidOrUnsupportedEntityRefs) {
        const err = validateEntityReference(entityRef.ref);
        expect(err).toBeTruthy();
        expect(err?.message).toEqual(entityRef.expectedError);
      }
    });

    it('should return an error when entity reference name is invalid', () => {
      const invalidEntityNames = [
        'john@doe',
        'John Doe',
        'John/Doe',
        'invalid-',
        'invalid_',
        '.invalid',
        `too-long${'1'.repeat(60)}`,
      ];

      for (const invalidName of invalidEntityNames) {
        const expectedError = `The name '${invalidName}' in the entity reference must be a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total`;
        const entityRef = `user:default/${invalidName}`;
        const err = validateEntityReference(entityRef);
        expect(err).toBeTruthy();
        expect(err?.message).toEqual(expectedError);
      }
    });

    it('should return an error when entity reference namespace is invalid', () => {
      const invalidEntityNamespaces = [
        'INVALID',
        'invalid-',
        '-invalid',
        'invalid$namespace',
        `too-long${'1'.repeat(60)}`,
      ];

      for (const invalidNamespace of invalidEntityNamespaces) {
        const expectedError = `The namespace '${invalidNamespace}' in the entity reference must be a string that is sequences of [a-z0-9] separated by [-], at most 63 characters in total`;
        const entityRef = `user:${invalidNamespace}/doe`;
        const err = validateEntityReference(entityRef);
        expect(err).toBeTruthy();
        expect(err?.message).toEqual(expectedError);
      }
    });

    it('should pass entity reference validation', () => {
      const validEntityRefs = [
        'user:default/guest',
        'role:default/team-a',
        'role:default/team_1',
        'role:default/team.A',
        'role:custom-1/doe',
      ];
      for (const entityRef of validEntityRefs) {
        const err = validateEntityReference(entityRef);
        expect(err).toBeFalsy();
      }
    });
  });

  describe('validateRole', () => {
    it('should return an error when "memberReferences" query param is missing', () => {
      const request = { name: 'role:default/user' } as any;
      const err = validateRole(request);
      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `'memberReferences' field must not be empty`,
      );
    });

    it('should pass validation when all required query params are present', () => {
      const request = {
        memberReferences: ['user:default/guest'],
        name: 'role:default/user',
      } as any;
      const err = validateRole(request);
      expect(err).toBeUndefined();
    });
  });

  describe('validateSource', () => {
    const roleMeta: RoleMetadataDao = {
      roleEntityRef: 'role:default/catalog-reader',
      source: 'rest',
      modifiedBy,
    };

    it('should not return an error whenever the source that is passed matches the source of the role', async () => {
      const source: Source = 'rest';

      const err = await validateSource(source, roleMeta);

      expect(err).toBeUndefined();
    });

    it('should not return an error whenever the source that is passed does not match a legacy source role', async () => {
      const roleMetaLegacy: RoleMetadataDao = {
        roleEntityRef: 'role:default/legacy-reader',
        source: 'legacy',
        modifiedBy,
      };

      const source: Source = 'rest';

      const err = await validateSource(source, roleMetaLegacy);

      expect(err).toBeUndefined();
    });

    it('should return an error whenever the source that is passed does not match the source of the role', async () => {
      const source: Source = 'csv-file';

      const err = await validateSource(source, roleMeta);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      );
    });
  });

  describe('validateGroupingPolicy', () => {
    let groupPolicy = ['user:default/test', 'role:default/catalog-reader'];
    let source: Source = 'rest';
    const roleMeta: RoleMetadataDao = {
      roleEntityRef: 'role:default/catalog-reader',
      source: 'rest',
      modifiedBy,
    };

    it('should not return an error during validation', async () => {
      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeUndefined();
    });

    it('should return an error if the grouping policy is too long', async () => {
      groupPolicy = [
        'user:default/test',
        'role:default/catalog-reader',
        'extra',
      ];

      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(`Group policy should have length 2`);
    });

    it('should return an error if a member starts with role:', async () => {
      groupPolicy = ['role:default/test', 'role:default/catalog-reader'];

      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. rbac-backend plugin doesn't support role inheritance.`,
      );
    });

    it('should return an error for group inheritance (user to group)', async () => {
      groupPolicy = ['user:default/test', 'group:default/catalog-reader'];

      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. User membership information could be provided only with help of Catalog API.`,
      );
    });

    it('should return an error for group inheritance (group to group)', async () => {
      groupPolicy = ['group:default/test', 'group:default/catalog-reader'];

      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeTruthy();
      expect(err?.message).toEqual(
        `Group policy is invalid: ${groupPolicy}. Group inheritance information could be provided only with help of Catalog API.`,
      );
    });

    it('should return an error for mismatch source', async () => {
      groupPolicy = ['user:default/test', 'role:default/catalog-reader'];
      source = 'csv-file';

      const err = await validateGroupingPolicy(groupPolicy, roleMeta, source);

      expect(err).toBeTruthy();
      expect(err?.name).toEqual('NotAllowedError');
      expect(err?.message).toEqual(
        `Unable to validate role ${groupPolicy}. Cause: source does not match originating role ${
          roleMeta.roleEntityRef
        }, consider making changes to the '${roleMeta.source.toLocaleUpperCase()}'`,
      );
    });
  });
});
