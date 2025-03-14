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
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';

import { replaceAliases } from './alias-resolver';

describe('replaceAliases', () => {
  describe('should replace "currentUser" aliases', () => {
    it('should replace aliases in the string value', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        rule: 'TEST',
        resourceType: 'test-entity',
        params: {
          test: '$currentUser',
        },
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        rule: 'TEST',
        resourceType: 'test-entity',
        params: {
          test: 'user:default/tim',
        },
      });
    });
  });

  it('should replace aliases in the string array', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['$currentUser'],
      },
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['user:default/tim'],
      },
    });
  });

  it('should replace aliases with criteria not', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      not: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['$currentUser'],
        },
      },
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      not: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['user:default/tim'],
        },
      },
    });
  });

  it('should replace aliases with criteria anyOf', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
      ],
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim'],
          },
        },
      ],
    });
  });

  it('should replace aliases with criteria anyOf and few values', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      anyOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });

  it('should replace aliases with criteria allOf', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
      ],
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim'],
          },
        },
      ],
    });
  });

  it('should replace aliases with criteria allOf and few values', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      allOf: [
        {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim'],
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });

  it('should replace aliases with nested criteria', () => {
    const conditionParam: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    > = {
      allOf: [
        {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$currentUser'],
            },
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    };

    replaceAliases(conditionParam, {
      userEntityRef: 'user:default/tim',
      ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
    });

    expect(conditionParam).toEqual({
      allOf: [
        {
          not: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim'],
            },
          },
        },
        {
          rule: 'IS_ENTITY_KIND',
          resourceType: 'catalog-entity',
          params: { kinds: ['Group', 'User'] },
        },
      ],
    });
  });

  describe('should replace "ownerRefs" aliases', () => {
    it('should replace aliases without criteria', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['$ownerRefs'],
        },
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['user:default/tim', 'group:default/team-a'],
        },
      });
    });

    it('should replace aliases with criteria not', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        not: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$ownerRefs'],
          },
        },
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        not: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['user:default/tim', 'group:default/team-a'],
          },
        },
      });
    });

    it('should replace aliases with criteria anyOf', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
        ],
      });
    });

    it('should replace aliases with criteria anyOf and few values', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      });
    });

    it('should replace aliases with criteria anyOf and few values in a different order', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        anyOf: [
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        anyOf: [
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
        ],
      });
    });

    it('should replace aliases with criteria anyOf and few values for other rules', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        anyOf: [
          {
            rule: 'HAS_ANNOTATION',
            resourceType: 'catalog-entity',
            params: { value: '$currentUser', annotation: 'template/creator' },
          },
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        anyOf: [
          {
            rule: 'HAS_ANNOTATION',
            resourceType: 'catalog-entity',
            params: {
              value: 'user:default/tim',
              annotation: 'template/creator',
            },
          },
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
        ],
      });
    });

    it('should replace aliases with criteria allOf', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        allOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        allOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
        ],
      });
    });

    it('should replace aliases with criteria allOf and few values', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        allOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['$ownerRefs'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        allOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/tim', 'group:default/team-a'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      });
    });

    it('should replace aliases with nested criteria', () => {
      const conditionParam: PermissionCriteria<
        PermissionCondition<string, PermissionRuleParams>
      > = {
        allOf: [
          {
            not: {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['$ownerRefs'],
              },
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      };

      replaceAliases(conditionParam, {
        userEntityRef: 'user:default/tim',
        ownershipEntityRefs: ['user:default/tim', 'group:default/team-a'],
      });

      expect(conditionParam).toEqual({
        allOf: [
          {
            not: {
              rule: 'IS_ENTITY_OWNER',
              resourceType: 'catalog-entity',
              params: {
                claims: ['user:default/tim', 'group:default/team-a'],
              },
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      });
    });
  });
});
