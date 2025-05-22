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
import {
  GroupEntity,
  isUserEntity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  AllOfCriteria,
  AnyOfCriteria,
  NotCriteria,
  PermissionCondition,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';

import { getTitleCase } from '@janus-idp/shared-react';

import {
  isResourcedPolicy,
  PermissionAction,
  PluginPermissionMetaData,
  PolicyDetails,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { criterias } from '../components/ConditionalAccess/const';
import { ConditionsData } from '../components/ConditionalAccess/types';
import {
  PluginsPermissionPoliciesData,
  RowPolicy,
  SelectedMember,
} from '../components/CreateRole/types';
import {
  MemberEntity,
  MembersData,
  PermissionsData,
  PermissionsDataSet,
} from '../types';
import { getMembersCount } from './create-role-utils';

export const getDefaultPermissions = (
  role: string,
  customPermissions?: Array<{
    permission: string;
    policy: string;
    effect: string;
  }>,
): RoleBasedPolicy[] => {
  // If custom permissions are provided, use them
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions.map(cp => ({
      entityReference: role,
      permission: cp.permission,
      policy: cp.policy,
      effect: cp.effect || 'allow',
      metadata: {
        source: 'default',
      },
    }));
  }

  // Default fallback if no custom permissions are provided
  return [
    {
      entityReference: role,
      permission: 'catalog-entity',
      policy: 'read',
      effect: 'allow',
      metadata: {
        source: 'default',
      },
    },
  ];
};

export const getPermissionsArray = (
  role: string,
  policies: RoleBasedPolicy[] | undefined,
  useDefaultPermissions = false,
  customPermissions?: Array<{
    permission: string;
    policy: string;
    effect: string;
  }>,
): RoleBasedPolicy[] => {
  if (!policies || policies?.length === 0 || !Array.isArray(policies)) {
    return [];
  }

  // Filter policies for the specific role with non-deny effect
  const userPolicies = policies.filter(
    (policy: RoleBasedPolicy) =>
      policy.entityReference === role && policy.effect !== 'deny',
  );

  // If user has no policies and default permissions are enabled, provide default access
  if (userPolicies.length === 0 && useDefaultPermissions) {
    return getDefaultPermissions(role, customPermissions);
  }

  return userPolicies;
};

export const getPermissions = (
  role: string,
  policies: RoleBasedPolicy[] | undefined,
  useDefaultPermissions = false,
  customPermissions?: Array<{
    permission: string;
    policy: string;
    effect: string;
  }>,
): number => {
  return getPermissionsArray(
    role,
    policies,
    useDefaultPermissions,
    customPermissions,
  ).length;
};

export const getMembersString = (res: {
  users: number;
  groups: number;
}): string => {
  let membersString = '';
  if (res.groups > 0) {
    membersString = `${res.groups} ${res.groups > 1 ? 'groups' : 'group'}`;
  }
  if (res.users > 0) {
    membersString = membersString.concat(
      membersString.length > 0 ? ', ' : '',
      `${res.users} ${res.users > 1 ? 'users' : 'user'}`,
    );
  }
  return membersString;
};

export const getMembers = (
  members: (string | MembersData | SelectedMember)[],
): string => {
  if (!members || members.length === 0) {
    return 'No members';
  }

  const res = members.reduce(
    (acc, member) => {
      if (typeof member === 'object') {
        if (member.type === 'User' || member.type === 'user') {
          acc.users++;
        } else {
          acc.groups++;
        }
      } else {
        const entity = parseEntityRef(member) as any;
        if (isUserEntity(entity)) {
          acc.users++;
        } else {
          acc.groups++;
        }
      }
      return acc;
    },
    { users: 0, groups: 0 },
  );

  return getMembersString(res);
};

export const getMembersFromGroup = (group: GroupEntity): number => {
  const membersList = group.relations?.reduce((acc, relation) => {
    let temp = acc;
    if (relation.type === 'hasMember') {
      temp++;
    }
    return temp;
  }, 0);
  return membersList ?? 0;
};

export const getPluginInfo = (
  permissions: PluginPermissionMetaData[],
  policy: RoleBasedPolicy,
): {
  pluginId: string;
  isResourced: boolean;
  resourceType?: string;
  permissionName: string;
  usingResourceType?: boolean;
} =>
  permissions.reduce(
    (
      acc: {
        pluginId: string;
        isResourced: boolean;
        resourceType?: string;
        permissionName: string;
        usingResourceType?: boolean;
      },
      p: PluginPermissionMetaData,
    ) => {
      const policyData = p.policies.find(pol => {
        if (pol.policy === policy.policy) {
          if (isResourcedPolicy(pol)) {
            if (pol.resourceType === policy.permission) {
              return true;
            }
          }
          if (pol.name === policy.permission) {
            return true;
          }
        }
        return false;
      });
      if (policyData) {
        return {
          pluginId: p.pluginId || '-',
          permissionName: policyData.name || '-',
          isResourced: isResourcedPolicy(policyData) || false,
          resourceType: isResourcedPolicy(policyData)
            ? policyData.resourceType
            : '',
          usingResourceType:
            isResourcedPolicy(policyData) &&
            policyData.resourceType === policy.permission,
        };
      }
      return acc;
    },
    { pluginId: '-', isResourced: false, permissionName: '-' },
  );

const getPolicy = (str: string) => {
  const arr = str.split('.');
  return arr[arr.length - 1];
};

const getAllPolicies = (
  permission: string,
  allowedPolicies: RowPolicy[],
  policies: PolicyDetails[],
) => {
  const deniedPolicies = policies?.reduce((acc, p) => {
    const perm = p.name;
    if (
      permission === perm &&
      !allowedPolicies.find(
        allowedPolicy =>
          allowedPolicy.policy.toLocaleLowerCase('en-US') ===
          p.policy?.toLocaleLowerCase('en-US'),
      )
    ) {
      acc.push({
        policy: getTitleCase(p.policy) || 'Use',
        effect: 'deny',
      });
    }
    return acc;
  }, [] as RowPolicy[]);
  return [...(allowedPolicies || []), ...(deniedPolicies || [])];
};

export const getPermissionsData = (
  policies: RoleBasedPolicy[] | undefined,
  permissionPolicies: PluginPermissionMetaData[],
): PermissionsData[] => {
  if (!policies || !Array.isArray(policies)) {
    return [];
  }

  const data = policies.reduce(
    (acc: PermissionsDataSet[], policy: RoleBasedPolicy) => {
      if (policy?.effect === 'allow') {
        const policyStr =
          policy?.policy ?? getPolicy(policy.permission as string);
        const policyTitleCase = getTitleCase(policyStr);
        const policyString = new Set<string>();
        const policiesSet = new Set<{ policy: string; effect: string }>();
        const {
          pluginId,
          isResourced,
          resourceType,
          permissionName,
          usingResourceType,
        } = getPluginInfo(permissionPolicies, policy);
        if (pluginId !== '-' && permissionName !== '-') {
          acc.push({
            permission: permissionName,
            plugin: pluginId,
            policyString: policyString.add(policyTitleCase || 'Use'),
            policies: policiesSet.add({
              policy: policyTitleCase || 'Use',
              effect: policy.effect,
            }),
            isResourced,
            resourceType,
            usingResourceType,
          });
        }
      }
      return acc;
    },
    [],
  );
  return data.map((p: PermissionsDataSet) => ({
    ...p,
    ...(p.policyString ? { policyString: Array.from(p.policyString) } : {}),
    policies: getAllPolicies(
      p.permission,
      Array.from(p.policies),
      permissionPolicies.find(pp => pp.pluginId === p.plugin)
        ?.policies as PolicyDetails[],
    ),
  })) as PermissionsData[];
};

export const getConditionUpperCriteria = (
  conditions: PermissionCriteria<PermissionCondition> | string,
): string | undefined => {
  return Object.keys(conditions).find(key =>
    [criterias.allOf, criterias.anyOf, criterias.not].includes(
      key as keyof ConditionsData,
    ),
  );
};

export const getConditionsData = (
  conditions: PermissionCriteria<PermissionCondition>,
): ConditionsData | undefined => {
  const upperCriteria =
    getConditionUpperCriteria(conditions) ?? criterias.condition;

  switch (upperCriteria) {
    case criterias.allOf: {
      const allOfConditions = (conditions as AllOfCriteria<PermissionCondition>)
        .allOf;
      allOfConditions.map(aoc => {
        if (getConditionUpperCriteria(aoc)) {
          return getConditionsData(aoc);
        }
        return aoc;
      });
      return { allOf: allOfConditions as PermissionCondition[] };
    }
    case criterias.anyOf: {
      const anyOfConditions = (conditions as AnyOfCriteria<PermissionCondition>)
        .anyOf;
      anyOfConditions.map(aoc => {
        if (getConditionUpperCriteria(aoc)) {
          return getConditionsData(aoc);
        }
        return aoc;
      });
      return { anyOf: anyOfConditions as PermissionCondition[] };
    }
    case criterias.not: {
      const notCondition = (conditions as NotCriteria<PermissionCondition>).not;
      const nestedCondition = getConditionUpperCriteria(notCondition)
        ? getConditionsData(notCondition)
        : notCondition;
      return { not: nestedCondition as PermissionCondition };
    }
    default:
      return { condition: conditions as PermissionCondition };
  }
};

export const getPoliciesData = (
  allowedPermissions: string[],
  policies: string[],
): RowPolicy[] => {
  return policies.map(p => ({
    policy: p,
    ...(allowedPermissions.includes(p.toLocaleLowerCase('en-US'))
      ? { effect: 'allow' }
      : { effect: 'deny' }),
  }));
};

export const getPolicyString = (policies: RowPolicy[]) => {
  const policyStr = policies.reduce((acc: string, p) => {
    if (p.effect === 'allow') return acc.concat(`${p.policy}, `);
    return acc;
  }, '');
  return policyStr.slice(0, policyStr.length - 2);
};

export const getConditionalPermissionsData = (
  conditionalPermissions: RoleConditionalPolicyDecision<PermissionAction>[],
  permissionPolicies: PluginsPermissionPoliciesData,
  allPermissionPolicies: PluginPermissionMetaData[],
): PermissionsData[] => {
  return conditionalPermissions.reduce((acc: any, cp) => {
    const conditions = getConditionsData(cp.conditions);
    const allowedPermissions = cp.permissionMapping.map(action =>
      action.toLocaleLowerCase('en-US'),
    );

    const pluginPermissionMetaData = allPermissionPolicies.find(
      pp => pp.pluginId === cp.pluginId,
    );

    const perms =
      pluginPermissionMetaData?.policies.filter(
        po =>
          isResourcedPolicy(po) &&
          po.resourceType === cp.resourceType &&
          allowedPermissions.includes(po.policy.toLocaleLowerCase('en-US')),
      ) ?? [];

    const allPolicies = (pm: string) =>
      permissionPolicies.pluginsPermissions?.[cp.pluginId]?.policies?.[pm]
        ?.policies ?? [];

    return [
      ...acc,
      ...(conditions
        ? perms.map((perm, index, arr) => {
            const policies = getPoliciesData(
              allowedPermissions,
              allPolicies(perm.name),
            );
            return {
              plugin: cp.pluginId,
              permission: perm.name,
              resourceType: cp.resourceType,
              isResourced: true,
              policies,
              policyString: getPolicyString(policies),
              conditions,
              ...(index === 0 ||
              !!policies.find(
                pl =>
                  pl.policy.toLocaleLowerCase('en-US') ===
                    arr[index - 1].policy && pl.effect === 'allow',
              )
                ? { id: cp.id }
                : {}),
            };
          })
        : []),
    ];
  }, []);
};

export const getSelectedMember = (
  memberResource: MemberEntity | undefined,
  ref: string,
): SelectedMember => {
  if (memberResource) {
    return {
      id: memberResource.metadata.etag as string,
      ref: stringifyEntityRef(memberResource),
      label:
        memberResource.spec.profile?.displayName ??
        memberResource.metadata.name,
      etag: memberResource.metadata.etag as string,
      type: memberResource.kind,
      namespace: memberResource.metadata.namespace as string,
      members: getMembersCount(memberResource),
    };
  } else if (ref) {
    const { kind, namespace, name } = parseEntityRef(ref);
    return {
      id: `${kind}-${namespace}-${name}`,
      ref,
      label: name,
      etag: `${kind}-${namespace}-${name}`,
      type: kind,
      namespace: namespace,
      members: kind === 'group' ? 0 : undefined,
    };
  }
  return {} as SelectedMember;
};

export const isSamePermissionPolicy = (
  a: RoleBasedPolicy,
  b: RoleBasedPolicy,
) =>
  a.entityReference === b.entityReference &&
  a.permission === b.permission &&
  a.policy === b.policy &&
  a.effect === b.effect;

export const onlyInLeft = (
  left: RoleBasedPolicy[],
  right: RoleBasedPolicy[],
  compareFunction: (a: RoleBasedPolicy, b: RoleBasedPolicy) => boolean,
) =>
  left.filter(
    leftValue =>
      !right.some(rightValue => compareFunction(leftValue, rightValue)),
  );
