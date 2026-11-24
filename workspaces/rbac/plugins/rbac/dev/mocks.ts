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

import {
  AccessCheckResponse,
  isResourcedPolicy,
  PermissionAction,
  permissionMappingAction,
  PluginPermissionMetaData,
  Role,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { mockApis } from '@backstage/test-utils';

import { mockConditionRules } from '../src/__fixtures__/mockConditionRules';
import { mockConditions } from '../src/__fixtures__/mockConditions';
import { mockMembers } from '../src/__fixtures__/mockMembers';
import { mockPermissionPolicies } from '../src/__fixtures__/mockPermissionPolicies';
import { mockPolicies } from '../src/__fixtures__/mockPolicies';
import { RBACAPI } from '../src/api/RBACBackendClient';
import type {
  MemberEntity,
  RoleBasedConditions,
  RoleError,
} from '../src/types';

// Dev-only conditional policy so the edit role flow can show conditional
// access changes for a role that is editable in the UI.
const devConditions: RoleConditionalPolicyDecision[] = [
  ...mockConditions,
  {
    id: 100,
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: { claims: ['group:default/janus-authors'] },
    },
    roleEntityRef: 'role:default/guests',
    permissionMapping: ['delete'],
  },
];

class MockRBACApi implements RBACAPI {
  readonly resources;

  constructor(fixtureData: Role[]) {
    this.resources = fixtureData;
  }

  async getRoles(): Promise<Role[]> {
    return this.resources;
  }

  async getAssociatedPolicies(
    entityReference: string,
  ): Promise<RoleBasedPolicy[]> {
    return mockPolicies.filter(pol => pol.entityReference === entityReference);
  }

  async getPolicies(): Promise<RoleBasedPolicy[]> {
    return mockPolicies;
  }

  async getUserAuthorization(): Promise<{ status: string }> {
    return {
      status: 'Authorized',
    };
  }

  async getRole(role: string): Promise<Role[] | Response> {
    const roleresource = this.resources.find(res => res.name === role);
    return roleresource
      ? [roleresource]
      : ({ status: 404, statusText: 'Not Found' } as Response);
  }

  async updateRole(_oldRole: Role, _newRole: Role): Promise<Response> {
    return { status: 200 } as Response;
  }

  async updatePolicies(
    _entityReference: string,
    _oldPolicies: RoleBasedPolicy[],
    _newPolicies: RoleBasedPolicy[],
  ): Promise<Response> {
    return { status: 204 } as Response;
  }

  async deleteRole(_roleName: string): Promise<Response> {
    return { status: 204, statusText: 'Deleted Successfully' } as Response;
  }

  async getMembers(): Promise<MemberEntity[] | Response> {
    return mockMembers;
  }

  async getMembersByRefs(
    entityRefs: string[],
  ): Promise<(MemberEntity | undefined)[]> {
    return entityRefs.map(ref => {
      const name = ref.split('/').pop();
      return mockMembers.find(m => m.metadata.name === name);
    });
  }

  async searchMembers(options?: {
    searchTerm?: string;
    limit?: number;
    offset?: number;
    kind?: 'user' | 'group';
    namespace?: string;
    orderBy?: 'name' | 'type' | 'namespace';
    orderDirection?: 'asc' | 'desc';
  }): Promise<{ items: MemberEntity[]; totalItems: number }> {
    const {
      searchTerm = '',
      limit = 100,
      offset = 0,
      kind,
      namespace,
      orderBy = 'name',
      orderDirection = 'asc',
    } = options ?? {};
    let filtered = [...mockMembers];
    if (kind) {
      filtered = filtered.filter(
        m => m.kind.toLowerCase() === kind.toLowerCase(),
      );
    }
    if (namespace) {
      filtered = filtered.filter(m => m.metadata.namespace === namespace);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.metadata.name.toLowerCase().includes(term),
      );
    }
    const direction = orderDirection === 'desc' ? -1 : 1;
    const sortValue = (member: (typeof mockMembers)[number]) => {
      if (orderBy === 'type') {
        return member.kind;
      }
      if (orderBy === 'namespace') {
        return member.metadata.namespace ?? '';
      }
      return member.metadata.name;
    };
    filtered.sort(
      (a, b) => sortValue(a).localeCompare(sortValue(b)) * direction,
    );
    return {
      items: filtered.slice(offset, offset + limit),
      totalItems: filtered.length,
    };
  }

  async getMemberNamespaces(): Promise<string[]> {
    return [
      ...new Set(
        mockMembers
          .map(m => m.metadata.namespace)
          .filter((ns): ns is string => Boolean(ns)),
      ),
    ].sort();
  }

  async listPermissions(): Promise<PluginPermissionMetaData[]> {
    return mockPermissionPolicies;
  }

  async deletePolicies(
    _entityRef: string,
    _policies: RoleBasedPolicy[],
  ): Promise<Response> {
    return {
      ok: true,
      status: 204,
      statusText: 'Deleted Successfully',
    } as Response;
  }

  async createRole(_role: Role): Promise<Response> {
    return { status: 200 } as Response;
  }

  async createPolicies(_policies: RoleBasedPolicy[]): Promise<Response> {
    return { status: 200 } as Response;
  }

  async getPluginsConditionRules(): Promise<any | Response> {
    return mockConditionRules;
  }

  async createConditionalPermission(
    _conditionalPermission: RoleBasedConditions,
  ): Promise<Response> {
    return { status: 200 } as Response;
  }

  async getRoleConditions(
    roleRef: string,
  ): Promise<RoleConditionalPolicyDecision[] | Response> {
    return devConditions.filter(mc => mc.roleEntityRef === roleRef);
  }

  async getAllRoleConditions(): Promise<
    RoleConditionalPolicyDecision[] | Response
  > {
    return mockConditions;
  }

  async updateConditionalPolicies(
    _conditionId: number,
    _data: RoleBasedConditions,
  ): Promise<RoleError | Response> {
    return { status: 200 } as Response;
  }

  async deleteConditionalPolicies(
    _conditionId: number,
  ): Promise<RoleError | Response> {
    return { status: 204 } as Response;
  }

  // Rough approximation for the dev app only: the backend is the reference
  // implementation (precedence, group ancestry and collisions differ here).
  async checkAccess(userEntityRef: string): Promise<AccessCheckResponse> {
    const roles = this.resources.filter(role =>
      role.memberReferences.some(
        ref => ref === userEntityRef || ref.startsWith('group:'),
      ),
    );
    const roleNames = roles.map(role => role.name);
    const decisions = mockPermissionPolicies.flatMap(plugin =>
      plugin.policies.map(policy => {
        const action = policy.policy as PermissionAction;
        const rows = mockPolicies.filter(
          row =>
            roleNames.includes(row.entityReference ?? '') &&
            row.policy === action &&
            (row.permission === policy.name ||
              (isResourcedPolicy(policy) &&
                row.permission === policy.resourceType)),
        );
        const allowedBy = rows
          .filter(row => row.effect !== 'deny')
          .map(row => row.entityReference!);
        const deniedBy = rows
          .filter(row => row.effect === 'deny')
          .map(row => row.entityReference!);
        const conditionalBy = mockConditions.filter(
          condition =>
            roleNames.includes(condition.roleEntityRef) &&
            isResourcedPolicy(policy) &&
            condition.resourceType === policy.resourceType &&
            condition.permissionMapping.some(
              entry => permissionMappingAction(entry) === action,
            ),
        );
        let result: AuthorizeResult = AuthorizeResult.DENY;
        if (conditionalBy.length > 0) {
          result = AuthorizeResult.CONDITIONAL;
        } else if (allowedBy.length > 0 && deniedBy.length === 0) {
          result = AuthorizeResult.ALLOW;
        }
        return {
          pluginId: plugin.pluginId,
          permission: policy.name,
          ...(isResourcedPolicy(policy)
            ? { resourceType: policy.resourceType }
            : {}),
          action,
          result,
          allowedBy,
          deniedBy,
          conditionalBy,
        };
      }),
    );
    return {
      userEntityRef,
      isSuperUser: false,
      roles: roles.map(role => ({
        roleEntityRef: role.name,
        via: role.memberReferences.filter(
          ref => ref === userEntityRef || ref.startsWith('group:'),
        ),
      })),
      decisions,
    };
  }
}

export const mockRBACApi = new MockRBACApi([
  {
    memberReferences: ['user:default/guest'],
    name: 'role:default/guests',
    metadata: { source: 'rest' },
  },
  {
    memberReferences: ['user:default/xyz', 'group:default/admins'],
    name: 'role:default/rbac_admin',
    metadata: { source: 'configuration' },
  },
]);

export const mockLicensedUsersApi = {
  async isLicensePluginEnabled(): Promise<boolean> {
    return false;
  },
  async downloadStatistics(): Promise<Response> {
    return { status: 200 } as Response;
  },
};

export const mockConfigApi = mockApis.config({
  data: { permission: { enabled: true } },
});
