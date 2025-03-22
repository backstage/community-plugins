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
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import type {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { validateRoleCondition } from './condition-validation';

describe('condition-validation', () => {
  describe('validation common fields', () => {
    it('should fail validation role condition without pluginId', () => {
      const condition: any = {
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'pluginId' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without permissionMapping', () => {
      const condition: any = {
        resourceType: 'catalog-entity',
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'permissionMapping' must be non empty array in the role condition`,
      );
    });

    it('should fail validation role condition with empty array permissionMapping', () => {
      const condition: any = {
        resourceType: 'catalog-entity',
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: [],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'permissionMapping' must be non empty array in the role condition`,
      );
    });

    it('should fail validation role condition with array permissionMapping, but with wrong action value', () => {
      const condition: any = {
        resourceType: 'catalog-entity',
        pluginId: 'catalog',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['wrong-value'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'permissionMapping' array contains non action value: 'wrong-value'`,
      );
    });

    it('should fail validation role condition with policy-entity resource type and create action', () => {
      const condition: any = {
        resourceType: 'policy-entity',
        pluginId: 'permission',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['create'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_OWNER',
              resourceType: 'policy-entity',
              params: { key: 'owner', values: ['user:default/mock'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `Conditional policy can not be created for resource type 'policy-entity' with the permission action 'create'`,
      );
    });

    it('should fail validation role condition without role entity reference', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'roleEntityRef' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without result', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'result' must be specified in the role condition`,
      );
    });

    it('should fail validation role condition without conditions', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'conditions' must be specified in the role condition`,
      );
    });
  });

  describe('validate simple condition', () => {
    it('should fail validation role-condition.conditions without rule', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.condition`,
      );
    });

    it('should fail validation role-condition.conditions without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.condition`,
      );
    });

    it('should validate role-condition.conditions without errors', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });

    it('should validate role-condition.conditions with permission policy action of use without errors', () => {
      const condition: any = {
        pluginId: 'scaffolder',
        resourceType: 'scaffolder-action',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['use'],
        conditions: {
          rule: 'HAS_ACTION_ID',
          resourceType: 'scaffolder-action',
          params: {
            actionId: 'quay:create-repository',
          },
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate "not" criteria', () => {
    it('should fail validation role-condition.conditions.not without rule', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        permissionMapping: ['read'],
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          not: {
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.not.condition`,
      );
    });

    it('should fail validation role-condition.conditions.not without resourceType', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          not: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.not.condition`,
      );
    });

    it('should validate role-condition.conditions.not without errors', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }

      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate anyOf criteria', () => {
    it('should fail validation role-condition.conditions.anyOf with an empty array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.anyOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf with non array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.anyOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without resourceType in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.anyOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without resourceType in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.anyOf[1].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without rule in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.anyOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.anyOf without rule in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.anyOf[1].condition`,
      );
    });

    it('should validate role-condition.conditions.anyOf without errors', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('validate allOf criteria', () => {
    it('should fail validation role-condition.conditions.allOf with an empty array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.allOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.allOf with non array value', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: {
            rule: 'IS_ENTITY_OWNER',
            params: {
              claims: ['group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `roleCondition.conditions.allOf criteria must be non empty array`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without resourceType in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.allOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without resourceType in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'resourceType' must be specified in the roleCondition.conditions.allOf[1].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without rule in the first param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.allOf[0].condition`,
      );
    });

    it('should fail validation role-condition.conditions.allOf without rule in the second param', () => {
      const condition: any = {
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `'rule' must be specified in the roleCondition.conditions.allOf[1].condition`,
      );
    });

    it('should success validation role-condition.conditions.allOf', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });

  describe('complex conditions', () => {
    it('should fail validation of role-condition.conditions in parallel with condition rule', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/logarifm', 'group:default/team-a'],
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `RBAC plugin does not support parallel conditions alongside rules, consider reworking request to include nested condition criteria. Conditional criteria causing the error allOf, 'rule: IS_ENTITY_OWNER'.`,
      );
    });

    it('should fail validation of role-condition.conditions criteria (allOf, not) in parallel', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `RBAC plugin does not support parallel conditions, consider reworking request to include nested condition criteria. Conditional criteria causing the error allOf,not.`,
      );
    });

    it('should fail validation of role-condition.conditions criteria (allOf, anyOf) in parallel', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          allOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `RBAC plugin does not support parallel conditions, consider reworking request to include nested condition criteria. Conditional criteria causing the error allOf,anyOf.`,
      );
    });

    it('should fail validation of role-condition.conditions criteria (not, anyOf) in parallel', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/logarifm', 'group:default/team-a'],
            },
          },
          anyOf: [
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };
      expect(() => validateRoleCondition(condition)).toThrow(
        `RBAC plugin does not support parallel conditions, consider reworking request to include nested condition criteria. Conditional criteria causing the error anyOf,not.`,
      );
    });

    it('should validate role-condition.conditions that are nested', () => {
      const condition: RoleConditionalPolicyDecision<PermissionAction> = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        permissionMapping: ['read'],
        conditions: {
          anyOf: [
            {
              not: {
                rule: 'IS_ENTITY_OWNER',
                resourceType: 'catalog-entity',
                params: {
                  claims: ['user:default/logarifm', 'group:default/team-a'],
                },
              },
            },
            {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/logarifm', 'group:default/team-a'],
              },
            },
            {
              rule: 'IS_ENTITY_KIND',
              resourceType: 'catalog-entity',
              params: { kinds: ['Group'] },
            },
          ],
        },
      };

      let unexpectedErr;
      try {
        validateRoleCondition(condition);
      } catch (err) {
        unexpectedErr = err;
      }
      expect(unexpectedErr).toBeUndefined();
    });
  });
});
