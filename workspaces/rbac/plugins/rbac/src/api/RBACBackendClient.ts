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
  PermissionAction,
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
 * @public
 */
export interface DefaultPermissionPolicy {
  permission: string;
  policy: string; // This is the action (e.g., 'read', 'use', 'create')
  effect: string; // 'allow' or 'deny'
}

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
  getMembers: () => Promise<MemberEntity[] | Response>;
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
  ) => Promise<RoleConditionalPolicyDecision<PermissionAction>[] | Response>;
  updateConditionalPolicies: (
    conditionId: number,
    data: RoleBasedConditions,
  ) => Promise<RoleError | Response>;
  deleteConditionalPolicies: (
    conditionId: number,
  ) => Promise<RoleError | Response>;
  getDefaultPermissions: () => Promise<DefaultPermissionPolicy[] | Response>;
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

  async getMembers() {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/catalog/entities?filter=kind=user&filter=kind=group`,
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

  async getDefaultPermissions(): Promise<DefaultPermissionPolicy[] | Response> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const fetchResponse = await fetch(
      `${backendUrl}/api/permission/default-permissions`,
      {
        // Renamed to fetchResponse for clarity
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
          'Content-Type': 'application/json',
        },
      },
    );

    if (fetchResponse.status !== 200) {
      return fetchResponse; // Return the raw response if not OK
    }

    const jsonData = await fetchResponse.json();
    return jsonData as DefaultPermissionPolicy[]; // Assuming jsonData is already the correct type
  }
}
