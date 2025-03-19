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
import { AuditorService, AuthService } from '@backstage/backend-plugin-api';
import type { MetadataResponse } from '@backstage/plugin-permission-node';

import {
  difference,
  fromPairs,
  isArray,
  isEqual,
  isPlainObject,
  omitBy,
  sortBy,
  toPairs,
  ValueKeyIteratee,
} from 'lodash';

import {
  PermissionAction,
  PermissionInfo,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
  Source,
} from '@backstage-community/plugin-rbac-common';

import { RoleEvents } from './auditor/auditor';
import { RoleMetadataDao, RoleMetadataStorage } from './database/role-metadata';
import { EnforcerDelegate } from './service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from './service/plugin-endpoints';

export function policyToString(policy: string[]): string {
  return `[${policy.join(', ')}]`;
}

export function typedPolicyToString(policy: string[], type: string): string {
  return `${type}, ${policy.join(', ')}`;
}

export function policiesToString(policies: string[][]): string {
  const policiesString = policies
    .map(policy => policyToString(policy))
    .join(',');
  return `[${policiesString}]`;
}

export function typedPoliciesToString(
  policies: string[][],
  type: string,
): string {
  const policiesString = policies
    .map(policy => {
      return policy.length !== 0 ? typedPolicyToString(policy, type) : '';
    })
    .join('\n');
  return `
    ${policiesString}
  `;
}

export function metadataStringToPolicy(policy: string): string[] {
  return policy.replace('[', '').replace(']', '').split(', ');
}

export async function removeTheDifference(
  originalGroup: string[],
  addedGroup: string[],
  source: Source,
  roleEntityRef: string,
  enf: EnforcerDelegate,
  auditor: AuditorService,
  modifiedBy: string,
): Promise<void> {
  originalGroup.sort((a, b) => a.localeCompare(b));
  addedGroup.sort((a, b) => a.localeCompare(b));
  const missing = difference(originalGroup, addedGroup);

  const groupPolicies: string[][] = [];
  for (const missingRole of missing) {
    groupPolicies.push([missingRole, roleEntityRef]);
  }

  if (groupPolicies.length === 0) {
    return;
  }

  const roleMetadata = { source, modifiedBy, roleEntityRef };
  const existingMembers = await enf.getFilteredGroupingPolicy(1, roleEntityRef);
  const eventId =
    existingMembers.length === missing.length
      ? RoleEvents.ROLE_DELETE
      : RoleEvents.ROLE_UPDATE;
  const message =
    existingMembers.length === missing.length
      ? 'Deleted role'
      : 'Updated role: deleted members';
  const auditorEvent = await auditor.createEvent({
    eventId,
    severityLevel: 'medium',
    meta: {
      ...roleMetadata,
      members: groupPolicies.map(gp => gp[0]),
    },
  });

  try {
    await enf.removeGroupingPolicies(groupPolicies, roleMetadata, false);
    await auditorEvent.success({ meta: { message } });
  } catch (error) {
    await auditorEvent.fail({
      error,
    });
    throw error;
  }
}

export function transformArrayToPolicy(policyArray: string[]): RoleBasedPolicy {
  const [entityReference, permission, policy, effect] = policyArray;
  return { entityReference, permission, policy, effect };
}

export function transformPolicyGroupToLowercase(policyArray: string[]) {
  if (
    policyArray.length > 1 &&
    policyArray[0].startsWith('g') &&
    (policyArray[1].startsWith('user') || policyArray[1].startsWith('group'))
  ) {
    policyArray[1] = policyArray[1].toLocaleLowerCase('en-US');
  }
}

export function transformRolesGroupToLowercase(roles: string[][]) {
  return roles.map(role =>
    role.length >= 1
      ? [role[0].toLocaleLowerCase('en-US'), ...role.slice(1)]
      : role,
  );
}

export function deepSortedEqual(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  excludeFields?: string[],
): boolean {
  let copyObj1;
  let copyObj2;
  if (excludeFields) {
    const excludeFieldsPredicate: ValueKeyIteratee<any> = (_value, key) => {
      for (const field of excludeFields) {
        if (key === field) {
          return true;
        }
      }
      return false;
    };
    copyObj1 = omitBy(obj1, excludeFieldsPredicate);
    copyObj2 = omitBy(obj2, excludeFieldsPredicate);
  }

  const sortedObj1 = sortBy(toPairs(copyObj1 || obj1), ([key]) => key);
  const sortedObj2 = sortBy(toPairs(copyObj2 || obj2), ([key]) => key);

  return isEqual(sortedObj1, sortedObj2);
}

export function isPermissionAction(action: string): action is PermissionAction {
  return ['create', 'read', 'update', 'delete', 'use'].includes(
    action as PermissionAction,
  );
}

export async function buildRoleSourceMap(
  policies: string[][],
  roleMetadata: RoleMetadataStorage,
): Promise<Map<string, Source | undefined>> {
  return await policies.reduce(
    async (
      acc: Promise<Map<string, Source | undefined>>,
      policy: string[],
    ): Promise<Map<string, Source | undefined>> => {
      const roleEntityRef = policy[0];
      const acummulator = await acc;
      if (!acummulator.has(roleEntityRef)) {
        const metadata = await roleMetadata.findRoleMetadata(roleEntityRef);
        acummulator.set(roleEntityRef, metadata?.source);
      }
      return acummulator;
    },
    Promise.resolve(new Map<string, Source | undefined>()),
  );
}

export function mergeRoleMetadata(
  currentMetadata: RoleMetadataDao,
  newMetadata: RoleMetadataDao,
): RoleMetadataDao {
  const mergedMetaData: RoleMetadataDao = { ...currentMetadata };
  mergedMetaData.lastModified =
    newMetadata.lastModified ?? new Date().toUTCString();
  mergedMetaData.modifiedBy = newMetadata.modifiedBy;
  mergedMetaData.description =
    newMetadata.description ?? currentMetadata.description;
  mergedMetaData.roleEntityRef = newMetadata.roleEntityRef;
  mergedMetaData.source = newMetadata.source;
  return mergedMetaData;
}

export async function processConditionMapping(
  roleConditionPolicy: RoleConditionalPolicyDecision<PermissionAction>,
  pluginPermMetaData: PluginPermissionMetadataCollector,
  auth: AuthService,
): Promise<RoleConditionalPolicyDecision<PermissionInfo>> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: roleConditionPolicy.pluginId,
  });

  const rule: MetadataResponse | undefined =
    await pluginPermMetaData.getMetadataByPluginId(
      roleConditionPolicy.pluginId,
      token,
    );
  if (!rule?.permissions) {
    throw new Error(
      `Unable to get permission list for plugin ${roleConditionPolicy.pluginId}`,
    );
  }

  const permInfo: PermissionInfo[] = [];
  for (const action of roleConditionPolicy.permissionMapping) {
    const perm = rule.permissions.find(
      permission =>
        permission.type === 'resource' &&
        (action === permission.attributes.action ||
          (action === 'use' && permission.attributes.action === undefined)),
    );
    if (!perm) {
      throw new Error(
        `Unable to find permission to get permission name for resource type '${
          roleConditionPolicy.resourceType
        }' and action ${JSON.stringify(action)}`,
      );
    }
    permInfo.push({ name: perm.name, action });
  }

  return {
    ...roleConditionPolicy,
    permissionMapping: permInfo,
  };
}

export function deepSort(value: any): any {
  if (isArray(value)) {
    return sortBy(value.map(deepSort));
  } else if (isPlainObject(value)) {
    return fromPairs(
      sortBy(
        toPairs(value).map(([k, v]: [string, any]) => [k, deepSort(v)]),
        0,
      ),
    );
  }
  return value;
}

export function deepSortEqual(obj1: any, obj2: any): boolean {
  return isEqual(deepSort(obj1), deepSort(obj2));
}
