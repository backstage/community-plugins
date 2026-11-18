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
import { parseEntityRef } from '@backstage/catalog-model';
import {
  PermissionCondition,
  PermissionCriteria,
} from '@backstage/plugin-permission-common';

import {
  isResourcedPolicy,
  PluginPermissionMetaData,
  Role,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { isPolicyCoveredByCondition } from './rbac-utils';
import { isRoleEditableInUI, ROLE_SOURCE_LEGACY } from './role-source-utils';

/**
 * Display name for a role in the sidebar: the role's own name, keeping the
 * namespace as a suffix when it is not "default".
 */
export const getShortRoleName = (roleRef: string): string => {
  try {
    const { namespace, name } = parseEntityRef(roleRef);
    return namespace === 'default' ? name : `${name} (${namespace})`;
  } catch {
    return roleRef;
  }
};

/** Decision shown in a matrix cell; `none` means the role has no policy for the permission. */
export type MatrixDecision = 'allow' | 'deny' | 'conditional' | 'none';

export type MatrixCell =
  | { decision: Exclude<MatrixDecision, 'conditional'> }
  | { decision: 'conditional'; rules: string[] };

type MatrixColumn = {
  id: string;
  pluginId: string;
  permission: string;
  action: string;
  resourceType?: string;
};

export type MatrixPluginGroup = {
  pluginId: string;
  columns: MatrixColumn[];
};

export type MatrixRow = {
  roleName: string;
  source: string;
  editable: boolean;
  /** Cells keyed by column id; columns without an entry have no policy. */
  cells: ReadonlyMap<string, MatrixCell>;
};

export type PermissionsMatrix = {
  plugins: MatrixPluginGroup[];
  rows: MatrixRow[];
};

type BasicEffect = 'allow' | 'deny';

const NO_POLICY: MatrixCell = { decision: 'none' };

const policyKey = (permission: string, action: string) =>
  `${permission}\u0000${action.toLocaleLowerCase('en-US')}`;

/** Collects the rule names of a (possibly nested) condition, in order of appearance. */
export const getConditionRuleNames = (
  criteria: PermissionCriteria<PermissionCondition>,
): string[] => {
  if ('allOf' in criteria) {
    return criteria.allOf.flatMap(getConditionRuleNames);
  }
  if ('anyOf' in criteria) {
    return criteria.anyOf.flatMap(getConditionRuleNames);
  }
  if ('not' in criteria) {
    return getConditionRuleNames(criteria.not);
  }
  return [criteria.rule];
};

const buildPluginGroups = (
  permissions: PluginPermissionMetaData[],
): MatrixPluginGroup[] =>
  permissions
    .map(({ pluginId, policies }) => {
      const columns = new Map<string, MatrixColumn>();
      for (const policy of policies) {
        const id = `${pluginId}:${policy.name}:${policy.policy}`;
        if (!columns.has(id)) {
          columns.set(id, {
            id,
            pluginId,
            permission: policy.name,
            action: policy.policy,
            resourceType: isResourcedPolicy(policy)
              ? policy.resourceType
              : undefined,
          });
        }
      }
      return { pluginId, columns: [...columns.values()] };
    })
    .filter(group => group.columns.length > 0)
    .sort((a, b) => a.pluginId.localeCompare(b.pluginId));

/** Indexes a role's basic policies by permission and action; deny wins over allow. */
const indexBasicPolicies = (
  policies: RoleBasedPolicy[],
): Map<string, BasicEffect> => {
  const index = new Map<string, BasicEffect>();
  for (const { permission, policy, effect } of policies) {
    if (!permission || !policy || (effect !== 'allow' && effect !== 'deny')) {
      continue;
    }
    const key = policyKey(permission, policy);
    if (index.get(key) !== 'deny') {
      index.set(key, effect);
    }
  }
  return index;
};

const groupByRole = <T>(
  items: T[],
  getRoleRef: (item: T) => string | undefined,
): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const roleRef = getRoleRef(item);
    if (!roleRef) {
      continue;
    }
    const group = groups.get(roleRef);
    if (group) {
      group.push(item);
    } else {
      groups.set(roleRef, [item]);
    }
  }
  return groups;
};

/**
 * Resolves the cell for a single permission. Conditional policies take
 * precedence (matching the backend default), then a policy targeting the
 * permission by name, then one targeting its resource type. The name-first
 * order mirrors the backend: when a named policy exists, enforcement uses the
 * permission name as the object and the resource-type policy is not consulted
 * (rbac-backend `permission-policy.ts`, "higher priority for permission
 * specified by name").
 */
const resolveCell = (
  column: MatrixColumn,
  basicPolicies: Map<string, BasicEffect>,
  conditions: RoleConditionalPolicyDecision[],
): MatrixCell => {
  const matchingConditions = conditions.filter(
    condition =>
      condition.pluginId === column.pluginId &&
      isPolicyCoveredByCondition(condition, {
        name: column.permission,
        policy: column.action,
        resourceType: column.resourceType,
      }),
  );
  if (matchingConditions.length > 0) {
    const rules = matchingConditions.flatMap(condition =>
      getConditionRuleNames(condition.conditions),
    );
    return { decision: 'conditional', rules: [...new Set(rules)] };
  }

  const effect =
    basicPolicies.get(policyKey(column.permission, column.action)) ??
    (column.resourceType
      ? basicPolicies.get(policyKey(column.resourceType, column.action))
      : undefined);
  return effect ? { decision: effect } : NO_POLICY;
};

/**
 * Builds a read-only roles × permissions matrix: one row per role and one
 * column per plugin permission and action, grouped by plugin.
 */
export const buildPermissionsMatrix = ({
  roles,
  policies,
  permissions,
  conditions,
}: {
  roles: Role[];
  policies: RoleBasedPolicy[];
  permissions: PluginPermissionMetaData[];
  conditions: RoleConditionalPolicyDecision[];
}): PermissionsMatrix => {
  const plugins = buildPluginGroups(permissions);
  const columns = plugins.flatMap(plugin => plugin.columns);
  const policiesByRole = groupByRole(policies, p => p.entityReference);
  const conditionsByRole = groupByRole(conditions, c => c.roleEntityRef);

  const rows = roles.map(role => {
    const basicPolicies = indexBasicPolicies(
      policiesByRole.get(role.name) ?? [],
    );
    const roleConditions = conditionsByRole.get(role.name) ?? [];
    const cells = new Map<string, MatrixCell>();
    for (const column of columns) {
      const cell = resolveCell(column, basicPolicies, roleConditions);
      if (cell.decision !== 'none') {
        cells.set(column.id, cell);
      }
    }
    const source = role.metadata?.source ?? ROLE_SOURCE_LEGACY;
    return {
      roleName: role.name,
      source,
      editable: isRoleEditableInUI(source),
      cells,
    };
  });

  return { plugins, rows };
};

export const getMatrixCell = (row: MatrixRow, columnId: string): MatrixCell =>
  row.cells.get(columnId) ?? NO_POLICY;

/**
 * Narrows the matrix to roles whose name contains `roleSearch` (case
 * insensitive), to the roles listed in `roleNames` when it is non-empty, and,
 * when `pluginId` is set, to that plugin's columns. When `decision` is set,
 * only the rows and columns where that decision appears are kept, so the
 * matrix shrinks to the area where the decision is actually used.
 */
export const filterPermissionsMatrix = (
  matrix: PermissionsMatrix,
  {
    roleSearch,
    pluginId,
    roleNames,
    decision,
  }: {
    roleSearch: string;
    pluginId?: string;
    roleNames?: string[];
    decision?: MatrixDecision;
  },
  locale = 'en',
): PermissionsMatrix => {
  const search = roleSearch.trim().toLocaleUpperCase(locale);
  const selectedRoles = roleNames?.length ? new Set(roleNames) : undefined;

  let plugins = pluginId
    ? matrix.plugins.filter(plugin => plugin.pluginId === pluginId)
    : matrix.plugins;
  let rows = matrix.rows.filter(
    row =>
      (!selectedRoles || selectedRoles.has(row.roleName)) &&
      (!search || row.roleName.toLocaleUpperCase(locale).includes(search)),
  );

  if (decision) {
    plugins = plugins
      .map(plugin => ({
        ...plugin,
        columns: plugin.columns.filter(column =>
          rows.some(row => getMatrixCell(row, column.id).decision === decision),
        ),
      }))
      .filter(plugin => plugin.columns.length > 0);
    const columns = plugins.flatMap(plugin => plugin.columns);
    rows = rows.filter(row =>
      columns.some(
        column => getMatrixCell(row, column.id).decision === decision,
      ),
    );
  }

  return { plugins, rows };
};
