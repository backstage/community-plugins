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
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  PluginPermissionMetaData,
  Role,
  RoleBasedPolicy,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import {
  buildPermissionsMatrix,
  filterPermissionsMatrix,
  getConditionRuleNames,
  getMatrixCell,
} from './permissions-matrix-utils';

const permissions: PluginPermissionMetaData[] = [
  {
    pluginId: 'scaffolder',
    policies: [
      {
        name: 'scaffolder.template.read',
        policy: 'read',
        resourceType: 'scaffolder-template',
      },
    ],
  },
  {
    pluginId: 'catalog',
    policies: [
      {
        name: 'catalog.entity.read',
        policy: 'read',
        resourceType: 'catalog-entity',
      },
      {
        name: 'catalog.entity.delete',
        policy: 'delete',
        resourceType: 'catalog-entity',
      },
      { name: 'catalog.entity.create', policy: 'create' },
      // duplicated entries must not produce duplicated columns
      { name: 'catalog.entity.create', policy: 'create' },
    ],
  },
  { pluginId: 'empty', policies: [] },
];

const roles: Role[] = [
  {
    name: 'role:default/ui',
    memberReferences: [],
    metadata: { source: 'rest' },
  },
  {
    name: 'role:default/csv',
    memberReferences: [],
    metadata: { source: 'csv-file' },
  },
  { name: 'role:default/legacy', memberReferences: [] },
];

const policies: RoleBasedPolicy[] = [
  {
    entityReference: 'role:default/ui',
    permission: 'catalog.entity.read',
    policy: 'read',
    effect: 'allow',
  },
  // deny wins over allow for the same permission and action
  {
    entityReference: 'role:default/ui',
    permission: 'catalog.entity.create',
    policy: 'create',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/ui',
    permission: 'catalog.entity.create',
    policy: 'create',
    effect: 'deny',
  },
  // resource type policies apply to every permission of that type
  {
    entityReference: 'role:default/csv',
    permission: 'catalog-entity',
    policy: 'delete',
    effect: 'allow',
  },
  // a policy by name has priority over a resource type policy
  {
    entityReference: 'role:default/csv',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'role:default/csv',
    permission: 'catalog.entity.read',
    policy: 'read',
    effect: 'deny',
  },
];

const conditions: RoleConditionalPolicyDecision[] = [
  {
    id: 1,
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    roleEntityRef: 'role:default/ui',
    permissionMapping: ['delete'],
    conditions: {
      anyOf: [
        { rule: 'IS_ENTITY_OWNER', resourceType: 'catalog-entity', params: {} },
        {
          not: {
            rule: 'HAS_LABEL',
            resourceType: 'catalog-entity',
            params: {},
          },
        },
      ],
    },
  },
  {
    id: 2,
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'scaffolder',
    resourceType: 'scaffolder-template',
    roleEntityRef: 'role:default/legacy',
    permissionMapping: [{ name: 'scaffolder.template.read', action: 'read' }],
    conditions: {
      rule: 'HAS_TAG',
      resourceType: 'scaffolder-template',
      params: {},
    },
  },
  // conditions override basic policies for the same permission
  {
    id: 3,
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    roleEntityRef: 'role:default/csv',
    permissionMapping: ['delete'],
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {},
    },
  },
];

describe('permissions-matrix-utils', () => {
  it('builds plugin columns and resolves allow, deny, conditional and empty cells per role', () => {
    const matrix = buildPermissionsMatrix({
      roles,
      policies,
      permissions,
      conditions,
    });

    expect(matrix.plugins.map(p => p.pluginId)).toEqual([
      'catalog',
      'scaffolder',
    ]);
    expect(matrix.plugins[0].columns.map(c => c.id)).toEqual([
      'catalog:catalog.entity.read:read',
      'catalog:catalog.entity.delete:delete',
      'catalog:catalog.entity.create:create',
    ]);
    expect(matrix.plugins[0].columns[2].resourceType).toBeUndefined();

    const [ui, csv, legacy] = matrix.rows;
    expect(
      matrix.rows.map(({ roleName, source, editable }) => ({
        roleName,
        source,
        editable,
      })),
    ).toEqual([
      { roleName: 'role:default/ui', source: 'rest', editable: true },
      { roleName: 'role:default/csv', source: 'csv-file', editable: false },
      { roleName: 'role:default/legacy', source: 'legacy', editable: false },
    ]);

    expect(getMatrixCell(ui, 'catalog:catalog.entity.read:read')).toEqual({
      decision: 'allow',
    });
    expect(getMatrixCell(ui, 'catalog:catalog.entity.create:create')).toEqual({
      decision: 'deny',
    });
    expect(getMatrixCell(ui, 'catalog:catalog.entity.delete:delete')).toEqual({
      decision: 'conditional',
      rules: ['IS_ENTITY_OWNER', 'HAS_LABEL'],
    });
    expect(
      getMatrixCell(ui, 'scaffolder:scaffolder.template.read:read'),
    ).toEqual({ decision: 'none' });

    expect(getMatrixCell(csv, 'catalog:catalog.entity.read:read')).toEqual({
      decision: 'deny',
    });
    expect(getMatrixCell(csv, 'catalog:catalog.entity.delete:delete')).toEqual({
      decision: 'conditional',
      rules: ['IS_ENTITY_OWNER'],
    });

    expect(
      getMatrixCell(legacy, 'scaffolder:scaffolder.template.read:read'),
    ).toEqual({ decision: 'conditional', rules: ['HAS_TAG'] });
    expect(legacy.cells.size).toBe(1);
  });

  it('returns an empty matrix without plugins or roles and collects nested rule names', () => {
    expect(
      buildPermissionsMatrix({
        roles: [],
        policies,
        permissions: [],
        conditions,
      }),
    ).toEqual({ plugins: [], rows: [] });

    expect(
      getConditionRuleNames({
        allOf: [
          { rule: 'A', resourceType: 'x', params: {} },
          {
            anyOf: [
              { rule: 'B', resourceType: 'x', params: {} },
              { not: { rule: 'C', resourceType: 'x', params: {} } },
            ],
          },
        ],
      }),
    ).toEqual(['A', 'B', 'C']);
  });

  it('filters roles by name and columns by plugin', () => {
    const matrix = buildPermissionsMatrix({
      roles,
      policies,
      permissions,
      conditions,
    });

    expect(filterPermissionsMatrix(matrix, { roleSearch: '' })).toEqual(matrix);

    const filtered = filterPermissionsMatrix(matrix, {
      roleSearch: '  CSV ',
      pluginId: 'scaffolder',
    });
    expect(filtered.rows.map(r => r.roleName)).toEqual(['role:default/csv']);
    expect(filtered.plugins.map(p => p.pluginId)).toEqual(['scaffolder']);
  });

  it('narrows to the selected roles and to the requested decision', () => {
    const matrix = buildPermissionsMatrix({
      roles,
      policies,
      permissions,
      conditions,
    });

    const selected = filterPermissionsMatrix(matrix, {
      roleSearch: '',
      roleNames: ['role:default/ui', 'role:default/legacy'],
    });
    expect(selected.rows.map(r => r.roleName)).toEqual([
      'role:default/ui',
      'role:default/legacy',
    ]);
    expect(selected.plugins).toEqual(matrix.plugins);

    // only the rows and columns where a deny appears are kept
    const denies = filterPermissionsMatrix(matrix, {
      roleSearch: '',
      decision: 'deny',
    });
    expect(denies.rows.map(r => r.roleName)).toEqual([
      'role:default/ui',
      'role:default/csv',
    ]);
    expect(denies.plugins.map(p => p.pluginId)).toEqual(['catalog']);
    expect(denies.plugins[0].columns.map(c => c.permission)).toEqual([
      'catalog.entity.read',
      'catalog.entity.create',
    ]);

    const combined = filterPermissionsMatrix(matrix, {
      roleSearch: '',
      roleNames: ['role:default/csv'],
      decision: 'deny',
    });
    expect(combined.rows.map(r => r.roleName)).toEqual(['role:default/csv']);
    expect(combined.plugins[0].columns.map(c => c.permission)).toEqual([
      'catalog.entity.read',
    ]);
  });

  it('keeps a deny even when an allow for the same permission comes later', () => {
    const matrix = buildPermissionsMatrix({
      roles: [{ name: 'role:default/x', memberReferences: [] }],
      policies: [
        {
          entityReference: 'role:default/x',
          permission: 'catalog.entity.create',
          policy: 'create',
          effect: 'deny',
        },
        {
          entityReference: 'role:default/x',
          permission: 'catalog.entity.create',
          policy: 'create',
          effect: 'allow',
        },
      ],
      permissions,
      conditions: [],
    });

    const column = matrix.plugins
      .find(plugin => plugin.pluginId === 'catalog')
      ?.columns.find(c => c.permission === 'catalog.entity.create');
    if (!column) {
      throw new Error('catalog.entity.create column missing');
    }
    expect(getMatrixCell(matrix.rows[0], column.id)).toEqual({
      decision: 'deny',
    });
  });

  it('ignores malformed policies and policies without a role reference', () => {
    const matrix = buildPermissionsMatrix({
      roles: [
        {
          name: 'role:default/ui',
          memberReferences: [],
          metadata: { source: 'rest' },
        },
      ],
      policies: [
        {
          entityReference: 'role:default/ui',
          permission: 'catalog.entity.read',
          policy: 'read',
          effect: 'unknown',
        },
        {
          entityReference: 'role:default/ui',
          permission: '',
          policy: 'read',
          effect: 'allow',
        },
        {
          permission: 'catalog.entity.read',
          policy: 'read',
          effect: 'allow',
        },
      ],
      permissions: [
        {
          pluginId: 'catalog',
          policies: [
            {
              name: 'catalog.entity.read',
              policy: 'read',
              resourceType: 'catalog-entity',
            },
          ],
        },
      ],
      conditions: [],
    });

    expect(
      getMatrixCell(matrix.rows[0], 'catalog:catalog.entity.read:read'),
    ).toEqual({ decision: 'none' });
  });
});
