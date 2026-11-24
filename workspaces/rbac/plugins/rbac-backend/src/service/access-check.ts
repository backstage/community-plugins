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

/** The identifying fields of a decision, without its outcome. */
type DecisionSubject = Pick<
  AccessCheckDecision,
  'pluginId' | 'permission' | 'resourceType' | 'action'
>;

/** Everything `decide` needs that is the same for every permission. */
type EvaluationContext = {
  roles: string[];
  policyRows: string[][];
  conditions: RoleConditionalPolicyDecision[];
  preferBasic: boolean;
};

/**
 * Explains the decisions the RBAC permission policy makes for one user: which
 * roles the user has, and per plugin permission whether the policy answers
 * allow, deny, or conditional, and which policies that answer comes from.
 *
 * The evaluation mirrors RBACPermissionPolicy.handle for a user that
 * authenticates with the given entity reference. Three aspects of a live
 * request cannot be reproduced here and are intentionally out of scope:
 * conditional decisions are reported as stored, without being evaluated
 * against a resource; the ownership entity references of the user's session
 * (used by the superUsers list and the $ownerRefs condition alias) are
 * unknown, so a super user is only recognized by their own entity reference;
 * and for the same reason, when `permission.rbac.useOwnershipEntityRefs` is
 * enabled, roles granted to session ownership references that differ from
 * the user's catalog group memberships are not resolved.
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
    // The role manager appends the configured default role unconditionally,
    // so a role the user is also an explicit member of comes back twice.
    const roles = [
      ...new Set(await this.enforcer.getRolesForUser(userEntityRef)),
    ];
    const memberships = await this.resolveMemberships(userEntityRef, roles);

    if (isSuperUser) {
      return {
        userEntityRef,
        isSuperUser,
        roles: memberships,
        decisions: pluginPolicies.flatMap(plugin =>
          plugin.policies.map(policy =>
            emptyDecision(
              describePermission(plugin.pluginId, policy),
              AuthorizeResult.ALLOW,
            ),
          ),
        ),
      };
    }

    // Both config keys are read the same way RBACPermissionPolicy.build
    // reads them; keep them in sync with that method.
    const context: EvaluationContext = {
      roles,
      policyRows: await this.collectPolicyRows(userEntityRef, roles),
      conditions:
        roles.length > 0
          ? await this.conditionalStorage.filterConditions(roles)
          : [],
      preferBasic:
        (this.config.getOptionalString(
          'permission.rbac.policyDecisionPrecedence',
        ) ?? 'conditional') === 'basic',
    };

    const decisions = pluginPolicies.flatMap(plugin =>
      plugin.policies.map(policy =>
        this.decide(plugin.pluginId, policy, context),
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
    return await Promise.all(
      roles.map(async role => {
        const members = (
          await this.enforcer.getFilteredGroupingPolicy(1, role)
        ).map(groupingPolicy => groupingPolicy[0]);
        const linked = await Promise.all(
          [...new Set(members)].map(async member =>
            (await this.enforcer.isUserLinkedTo(userEntityRef, member))
              ? member
              : undefined,
          ),
        );
        return {
          roleEntityRef: role,
          via: linked.filter((member): member is string => !!member),
        };
      }),
    );
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
      const rowsPerRole = await Promise.all(
        roles.map(role => this.enforcer.getFilteredPolicy(0, role)),
      );
      return rowsPerRole.flat();
    }

    const directRows = (await this.enforcer.getPolicy()).filter(
      row => row[0].startsWith('user:') || row[0].startsWith('group:'),
    );
    const subjects = [...new Set(directRows.map(row => row[0]))];
    const linkedSubjects = new Set(
      (
        await Promise.all(
          subjects.map(async subject =>
            (await this.enforcer.isUserLinkedTo(userEntityRef, subject))
              ? subject
              : undefined,
          ),
        )
      ).filter((subject): subject is string => !!subject),
    );
    return directRows.filter(row => linkedSubjects.has(row[0]));
  }

  private decide(
    pluginId: string,
    policy: PolicyDetails,
    context: EvaluationContext,
  ): AccessCheckDecision {
    const { roles, policyRows, conditions, preferBasic } = context;
    const action = toAction(policy.policy);
    const permission = policy.name;

    const hasRolePolicy = (obj: string) =>
      roles.length > 0 &&
      policyRows.some(
        row => roles.includes(row[0]) && row[1] === obj && row[2] === action,
      );
    const hasNamed = hasRolePolicy(permission);

    // Mirrors the policy's workaround for the legacy 'policy-entity' resource
    // type: policy.entity.create is declared as a basic permission, but when
    // no named policy exists it is still enforced as a resource permission.
    const effectivePolicy =
      !isResourcedPolicy(policy) &&
      permission === 'policy.entity.create' &&
      !hasNamed
        ? { ...policy, resourceType: 'policy-entity' }
        : policy;

    const base = describePermission(pluginId, effectivePolicy);

    if (isResourcedPolicy(effectivePolicy)) {
      const matchedConditions = conditions.filter(
        condition =>
          condition.resourceType === effectivePolicy.resourceType &&
          condition.permissionMapping.some(
            entry =>
              permissionMappingAction(entry) === action &&
              (!isPermissionInfo(entry) || entry.name === permission),
          ),
      );
      // Named permission policies win over resource-type ones.
      const obj = hasNamed ? permission : effectivePolicy.resourceType;
      const objRows = policyRows.filter(
        row => row[1] === obj && row[2] === action,
      );

      if (preferBasic) {
        if (hasNamed || hasRolePolicy(effectivePolicy.resourceType)) {
          return { ...base, ...basicDecision(objRows), conditionalBy: [] };
        }
        if (matchedConditions.length > 0) {
          return conditionalDecision(base, matchedConditions);
        }
        // Mirrors the policy: under basic precedence, a resource permission
        // with neither a role policy nor a condition is denied.
        return emptyDecision(base, AuthorizeResult.DENY);
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
): DecisionSubject {
  return {
    pluginId,
    permission: policy.name,
    ...(isResourcedPolicy(policy) ? { resourceType: policy.resourceType } : {}),
    action: toAction(policy.policy),
  };
}

function toAction(policyField: string): PermissionAction {
  return isValidPermissionAction(policyField) ? policyField : 'use';
}

function emptyDecision(
  subject: DecisionSubject,
  result: AuthorizeResult,
): AccessCheckDecision {
  return { ...subject, result, allowedBy: [], deniedBy: [], conditionalBy: [] };
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
  subject: DecisionSubject,
  matchedConditions: RoleConditionalPolicyDecision[],
): AccessCheckDecision {
  // A role holding more than one stored condition for the same permission is
  // a collision the policy answers with DENY (see
  // RBACPermissionPolicy.handleConditions); report it the same way, keeping
  // the colliding conditions so the caller can see why.
  const conditionsPerRole = new Map<string, number>();
  for (const condition of matchedConditions) {
    conditionsPerRole.set(
      condition.roleEntityRef,
      (conditionsPerRole.get(condition.roleEntityRef) ?? 0) + 1,
    );
  }
  const hasCollision = [...conditionsPerRole.values()].some(count => count > 1);
  return {
    ...subject,
    result: hasCollision ? AuthorizeResult.DENY : AuthorizeResult.CONDITIONAL,
    allowedBy: [],
    deniedBy: [],
    conditionalBy: matchedConditions,
  };
}
