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
import { parseEntityRef } from '@backstage/catalog-model';
import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  PluginPermissionMetaData,
  Role,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import {
  MemberEntity,
  PluginConditionRules,
  RoleBasedConditions,
  RoleError,
} from '../types';

/**
 * Catalog field to sort members by in {@link SearchMembersOptions}.
 *
 * @public
 */
export type SearchMembersOrderBy = 'name' | 'type' | 'namespace';

/**
 * Sort direction for {@link SearchMembersOptions}.
 *
 * @public
 */
export type SearchMembersOrderDirection = 'asc' | 'desc';

/**
 * Options for searching catalog users and groups.
 *
 * @public
 */
export type SearchMembersOptions = {
  searchTerm?: string;
  limit?: number;
  offset?: number;
  /** When set, only entities of this kind are returned. When omitted, both users and groups are returned. */
  kind?: 'user' | 'group';
  /** When set, only entities in this namespace are returned. */
  namespace?: string;
  /** Field to order by. Defaults to `name`. */
  orderBy?: SearchMembersOrderBy;
  /** Sort direction. Defaults to `asc`. */
  orderDirection?: SearchMembersOrderDirection;
};

/**
 * Paginated result from searching catalog users and groups.
 *
 * @public
 */
export type SearchMembersResult = {
  items: MemberEntity[];
  totalItems: number;
};

/**
 * @public
 */
export type RBACAPI = {
  getUserAuthorization: () => Promise<{ status: string }>;
  getRoles: () => Promise<Role[] | Response>;
  getPolicies: () => Promise<RoleBasedPolicy[] | Response>;
  getAssociatedPolicies: (
    entityReference: string,
  ) => Promise<RoleBasedPolicy[] | Response>;
  deleteRole: (role: string) => Promise<Response>;
  getRole: (role: string) => Promise<Role[] | Response>;
  getMembers: (
    page?: number,
    pageSize?: number,
  ) => Promise<MemberEntity[] | Response>;
  getMembersByRefs: (
    entityRefs: string[],
  ) => Promise<(MemberEntity | undefined)[] | Response>;
  searchMembers: (
    options?: SearchMembersOptions,
  ) => Promise<SearchMembersResult | Response>;
  getMemberNamespaces: () => Promise<string[] | Response>;
  listPermissions: () => Promise<PluginPermissionMetaData[] | Response>;
  createRole: (role: Role) => Promise<RoleError | Response>;
  updateRole: (oldRole: Role, newRole: Role) => Promise<RoleError | Response>;
  updatePolicies: (
    entityReference: string,
    oldPolicy: RoleBasedPolicy[],
    newPolicy: RoleBasedPolicy[],
  ) => Promise<RoleError | Response>;
  createPolicies: (polices: RoleBasedPolicy[]) => Promise<RoleError | Response>;
  deletePolicies: (
    entityReference: string,
    polices: RoleBasedPolicy[],
  ) => Promise<RoleError | Response>;
  getPluginsConditionRules: () => Promise<PluginConditionRules[] | Response>;
  createConditionalPermission: (
    conditionalPermission: RoleBasedConditions,
  ) => Promise<RoleError | Response>;
  getRoleConditions: (
    roleRef: string,
  ) => Promise<RoleConditionalPolicyDecision[] | Response>;
  updateConditionalPolicies: (
    conditionId: number,
    data: RoleBasedConditions,
  ) => Promise<RoleError | Response>;
  deleteConditionalPolicies: (
    conditionId: number,
  ) => Promise<RoleError | Response>;
};

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

/**
 * @public
 */
export const rbacApiRef = createApiRef<RBACAPI>({
  id: 'plugin.rbac.service',
});

export class RBACBackendClient implements RBACAPI {
  // @ts-ignore
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  async getUserAuthorization() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    return jsonResponse.json();
  }

  async getRoles() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });

    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }

    return jsonResponse.json();
  }

  async getPolicies() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/policies`, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async getAssociatedPolicies(entityReference: string) {
    const { kind, namespace, name } = parseEntityRef(entityReference);
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async deleteRole(role: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = parseEntityRef(role);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      },
    );
    return jsonResponse;
  }

  async getRole(role: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = parseEntityRef(role);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async getMembers(page?: number, pageSize?: number) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    let url = `${backendUrl}/api/catalog/entities?filter=kind=user&filter=kind=group`;

    if (page && pageSize) {
      const limit = pageSize;
      const offset = pageSize * (page - 1);
      url += `&limit=${limit}&offset=${offset}`;
    }

    const jsonResponse = await fetch(url, {
      headers: {
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
        'Content-Type': 'application/json',
      },
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async getMembersByRefs(entityRefs: string[]) {
    if (entityRefs.length === 0) {
      return [];
    }
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const batchSize = 2000;
    const results: (MemberEntity | undefined)[] = [];

    for (let i = 0; i < entityRefs.length; i += batchSize) {
      const batch = entityRefs.slice(i, i + batchSize);
      const jsonResponse = await fetch(
        `${backendUrl}/api/catalog/entities/by-refs`,
        {
          method: 'POST',
          headers: {
            ...(idToken && { Authorization: `Bearer ${idToken}` }),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entityRefs: batch,
            fields: [
              'metadata.name',
              'metadata.namespace',
              'metadata.etag',
              'kind',
              'spec.profile',
              'spec.members',
              'relations',
            ],
          }),
        },
      );
      if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
        return jsonResponse;
      }
      const data = await jsonResponse.json();
      results.push(...(data.items as (MemberEntity | undefined)[]));
    }

    return results;
  }

  async searchMembers(options: SearchMembersOptions = {}) {
    const {
      searchTerm = '',
      limit = 100,
      offset = 0,
      kind,
      namespace,
      orderBy = 'name',
      orderDirection = 'asc',
    } = options;
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const params = new URLSearchParams();
    // Each `filter` query param is an OR set; conditions within a set are AND.
    // e.g. kind=group,metadata.namespace=default → groups in that namespace only.
    const kinds = kind ? [kind] : ['user', 'group'];
    for (const entityKind of kinds) {
      params.append(
        'filter',
        namespace
          ? `kind=${entityKind},metadata.namespace=${namespace}`
          : `kind=${entityKind}`,
      );
    }
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    const orderFieldByColumn: Record<SearchMembersOrderBy, string> = {
      name: 'metadata.name',
      type: 'kind',
      namespace: 'metadata.namespace',
    };
    params.append(
      'orderField',
      `${orderFieldByColumn[orderBy]},${orderDirection}`,
    );
    if (searchTerm.trim()) {
      params.append('fullTextFilterTerm', searchTerm.trim());
      params.append('fullTextFilterFields', 'metadata.name');
      params.append('fullTextFilterFields', 'spec.profile.displayName');
    }
    const jsonResponse = await fetch(
      `${backendUrl}/api/catalog/entities/by-query?${params.toString()}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    const data = await jsonResponse.json();
    return {
      items: (data.items ?? []) as MemberEntity[],
      totalItems: data.totalItems ?? 0,
    };
  }

  async getMemberNamespaces() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const params = new URLSearchParams();
    params.append('facet', 'metadata.namespace');
    params.append('filter', 'kind=user');
    params.append('filter', 'kind=group');
    const jsonResponse = await fetch(
      `${backendUrl}/api/catalog/entity-facets?${params.toString()}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }
    const data = await jsonResponse.json();
    const facetValues = data?.facets?.['metadata.namespace'] ?? [];
    return (facetValues as { value: string }[])
      .map(entry => entry.value)
      .filter(Boolean)
      .sort();
  }

  async listPermissions() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/plugins/policies`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 204) {
      return jsonResponse;
    }

    return jsonResponse.json();
  }

  async createRole(role: Role) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(role),
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async updateRole(oldRole: Role, newRole: Role) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = parseEntityRef(oldRole.name);
    const body = {
      oldRole,
      newRole,
    };
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/${kind}/${namespace}/${name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(body),
      },
    );
    if (
      jsonResponse.status !== 200 &&
      jsonResponse.status !== 201 &&
      jsonResponse.status !== 204
    ) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async updatePolicies(
    entityReference: string,
    oldPolicies: RoleBasedPolicy[],
    newPolicies: RoleBasedPolicy[],
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = parseEntityRef(entityReference);
    const body = {
      oldPolicy: oldPolicies,
      newPolicy: newPolicies,
    };
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(body),
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async deletePolicies(entityReference: string, policies: RoleBasedPolicy[]) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const { kind, namespace, name } = parseEntityRef(entityReference);
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/policies/${kind}/${namespace}/${name}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(policies),
        method: 'DELETE',
      },
    );

    if (
      jsonResponse.status !== 200 &&
      jsonResponse.status !== 201 &&
      jsonResponse.status !== 204
    ) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async createPolicies(policies: RoleBasedPolicy[]) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(`${backendUrl}/api/permission/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(policies),
    });
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async getPluginsConditionRules() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/plugins/condition-rules`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async createConditionalPermission(
    conditionalPermission: RoleBasedConditions,
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/conditions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(conditionalPermission),
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async getRoleConditions(roleRef: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/conditions?roleEntityRef=${roleRef}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );
    if (jsonResponse.status !== 200) {
      return jsonResponse;
    }
    return jsonResponse.json();
  }

  async updateConditionalPolicies(
    conditionId: number,
    data: RoleBasedConditions,
  ) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/conditions/${conditionId}}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
        body: JSON.stringify(data),
      },
    );
    if (jsonResponse.status !== 200 && jsonResponse.status !== 201) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }

  async deleteConditionalPolicies(conditionId: number) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/permission/roles/conditions/${conditionId}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'DELETE',
      },
    );

    if (
      jsonResponse.status !== 200 &&
      jsonResponse.status !== 201 &&
      jsonResponse.status !== 204
    ) {
      return jsonResponse.json();
    }
    return jsonResponse;
  }
}
