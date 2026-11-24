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
import type { Config } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  AccessCheckDecision,
  AccessCheckResponse,
  AccessCheckRoleMembership,
  isPermissionInfo,
  isResourcedPolicy,
  isValidPermissionAction,
  permissionMappingAction,
  PermissionAction,
  PluginPermissionMetaData,
  PolicyDetails,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { EnforcerDelegate } from './enforcer-delegate';

/**
 * Explains the decisions the RBAC permission policy makes for one user: which
 * roles the user has, and per plugin permission whether the policy answers
 * allow, deny, or conditional, and which policies that answer comes from.
 *
 * The evaluation mirrors RBACPermissionPolicy.handle for a user that
 * authenticates with the given entity reference. Two aspects of a live
 * request cannot be reproduced here and are intentionally out of scope:
 * conditional decisions are reported as stored, without being evaluated
 * against a resource, and the ownership entity references of the user's
 * session (used by the superUsers list and the $ownerRefs condition alias)
 * are unknown, so a super user is only recognized by their own entity
 * reference.
 */
export class AccessCheckService {
  constructor(
    private readonly enforcer: EnforcerDelegate,
    private readonly conditionalStorage: ConditionalStorage,
    private readonly config: Config,
  ) {}

  async checkAccess(
    userEntityRef: string,
    pluginPolicies: PluginPermissionMetaData[],
  ): Promise<AccessCheckResponse> {
    const isSuperUser = this.getSuperUserList().includes(userEntityRef);
    const roles = await this.enforcer.getRolesForUser(userEntityRef);
    const memberships = await this.resolveMemberships(userEntityRef, roles);

    if (isSuperUser) {
      return {
        userEntityRef,
        isSuperUser,
        roles: memberships,
        decisions: pluginPolicies.flatMap(plugin =>
          plugin.policies.map(policy => ({
            ...describePermission(plugin.pluginId, policy),
            result: AuthorizeResult.ALLOW,
            allowedBy: [],
            deniedBy: [],
            conditionalBy: [],
          })),
        ),
      };
    }

    const policyRows = await this.collectPolicyRows(userEntityRef, roles);
    const conditions =
      roles.length > 0
        ? await this.conditionalStorage.filterConditions(roles)
        : [];
    const preferBasic =
      (this.config.getOptionalString(
        'permission.rbac.policyDecisionPrecedence',
      ) ?? 'conditional') === 'basic';

    const decisions = pluginPolicies.flatMap(plugin =>
      plugin.policies.map(policy =>
        this.decide(
          plugin.pluginId,
          policy,
          roles,
          policyRows,
          conditions,
          preferBasic,
        ),
      ),
    );

    return { userEntityRef, isSuperUser, roles: memberships, decisions };
  }

  private getSuperUserList(): string[] {
    return (
      this.config
        .getOptionalConfigArray('permission.rbac.admin.superUsers')
        ?.map(user => user.getString('name')) ?? []
    );
  }

  private async resolveMemberships(
    userEntityRef: string,
    roles: string[],
  ): Promise<AccessCheckRoleMembership[]> {
    const memberships: AccessCheckRoleMembership[] = [];
    for (const role of roles) {
      const groupingPolicies = await this.enforcer.getFilteredGroupingPolicy(
        1,
        role,
      );
      const via: string[] = [];
      for (const member of groupingPolicies.map(gp => gp[0])) {
        if (await this.enforcer.isUserLinkedTo(userEntityRef, member)) {
          via.push(member);
        }
      }
      memberships.push({ roleEntityRef: role, via });
    }
    return memberships;
  }

  /**
   * The policy rows the enforcer would consider for this user, in the same
   * way EnforcerDelegate.enforce selects them: the policies of the user's
   * roles when there are any, otherwise the policies assigned directly to
   * the user or to groups the user belongs to.
   */
  private async collectPolicyRows(
    userEntityRef: string,
    roles: string[],
  ): Promise<string[][]> {
    if (roles.length > 0) {
      const rows: string[][] = [];
      for (const role of roles) {
        rows.push(...(await this.enforcer.getFilteredPolicy(0, role)));
      }
      return rows;
    }

    const directRows = (await this.enforcer.getPolicy()).filter(
      row => row[0].startsWith('user:') || row[0].startsWith('group:'),
    );
    const linkedSubjects = new Set<string>();
    for (const subject of new Set(directRows.map(row => row[0]))) {
      if (await this.enforcer.isUserLinkedTo(userEntityRef, subject)) {
        linkedSubjects.add(subject);
      }
    }
    return directRows.filter(row => linkedSubjects.has(row[0]));
  }

  private decide(
    pluginId: string,
    policy: PolicyDetails,
    roles: string[],
    policyRows: string[][],
    conditions: RoleConditionalPolicyDecision[],
    preferBasic: boolean,
  ): AccessCheckDecision {
    const base = describePermission(pluginId, policy);
    const { permission, action } = base;

    const hasNamed =
      roles.length > 0 &&
      policyRows.some(
        row =>
          roles.includes(row[0]) && row[1] === permission && row[2] === action,
      );

    if (isResourcedPolicy(policy)) {
      const matchedConditions = conditions.filter(
        condition =>
          condition.resourceType === policy.resourceType &&
          condition.permissionMapping.some(
            entry =>
              permissionMappingAction(entry) === action &&
              (!isPermissionInfo(entry) || entry.name === permission),
          ),
      );
      // Named permission policies win over resource-type ones.
      const obj = hasNamed ? permission : policy.resourceType;
      const objRows = policyRows.filter(
        row => row[1] === obj && row[2] === action,
      );

      if (preferBasic) {
        const hasResourced =
          roles.length > 0 &&
          policyRows.some(
            row =>
              roles.includes(row[0]) &&
              row[1] === policy.resourceType &&
              row[2] === action,
          );
        if (hasNamed || hasResourced) {
          return { ...base, ...basicDecision(objRows), conditionalBy: [] };
        }
        if (matchedConditions.length > 0) {
          return conditionalDecision(base, matchedConditions);
        }
        // Mirrors the policy: under basic precedence, a resource permission
        // with neither a role policy nor a condition is denied.
        return {
          ...base,
          result: AuthorizeResult.DENY,
          allowedBy: [],
          deniedBy: [],
          conditionalBy: [],
        };
      }

      if (matchedConditions.length > 0) {
        return conditionalDecision(base, matchedConditions);
      }
      return { ...base, ...basicDecision(objRows), conditionalBy: [] };
    }

    const objRows = policyRows.filter(
      row => row[1] === permission && row[2] === action,
    );
    return { ...base, ...basicDecision(objRows), conditionalBy: [] };
  }
}

function describePermission(
  pluginId: string,
  policy: PolicyDetails,
): Pick<
  AccessCheckDecision,
  'pluginId' | 'permission' | 'resourceType' | 'action'
> {
  return {
    pluginId,
    permission: policy.name,
    ...(isResourcedPolicy(policy) ? { resourceType: policy.resourceType } : {}),
    action: toAction(policy.policy),
  };
}

function toAction(policy: string): PermissionAction {
  return isValidPermissionAction(policy) ? policy : 'use';
}

/**
 * Applies the casbin policy effect to the matched rows: allowed when some
 * policy allows and none denies, denied otherwise.
 */
function basicDecision(
  rows: string[][],
): Pick<AccessCheckDecision, 'result' | 'allowedBy' | 'deniedBy'> {
  const allowedBy = [
    ...new Set(rows.filter(row => row[3] !== 'deny').map(row => row[0])),
  ];
  const deniedBy = [
    ...new Set(rows.filter(row => row[3] === 'deny').map(row => row[0])),
  ];
  const result =
    allowedBy.length > 0 && deniedBy.length === 0
      ? AuthorizeResult.ALLOW
      : AuthorizeResult.DENY;
  return { result, allowedBy, deniedBy };
}

function conditionalDecision(
  base: Pick<
    AccessCheckDecision,
    'pluginId' | 'permission' | 'resourceType' | 'action'
  >,
  matchedConditions: RoleConditionalPolicyDecision[],
): AccessCheckDecision {
  return {
    ...base,
    result: AuthorizeResult.CONDITIONAL,
    allowedBy: [],
    deniedBy: [],
    conditionalBy: matchedConditions,
  };
}
