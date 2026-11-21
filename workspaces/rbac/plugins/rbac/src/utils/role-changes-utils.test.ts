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
import { conditionalPolicyRow as conditionalRow } from '../__fixtures__/mockConditionalPolicyRow';
import { RoleFormValues } from '../components/CreateRole/types';
import { PermissionsData } from '../types';
import { getRoleChanges } from './role-changes-utils';

const userMember = {
  label: 'Alice',
  etag: 'etag-alice',
  type: 'User',
  ref: 'user:default/alice',
};
const groupMember = {
  label: 'Team A',
  etag: 'etag-team-a',
  type: 'Group',
  ref: 'group:default/team-a',
};
const newMember = {
  label: 'Bob',
  etag: 'etag-bob',
  type: 'User',
  ref: 'user:default/bob',
};

const catalogReadRow: PermissionsData = {
  plugin: 'catalog',
  permission: 'catalog.entity.read',
  policies: [{ policy: 'Read', effect: 'allow' }],
};
const catalogCreateRow: PermissionsData = {
  plugin: 'catalog',
  permission: 'catalog.entity.create',
  policies: [{ policy: 'Create', effect: 'allow' }],
};
const initialValues: RoleFormValues = {
  kind: 'role',
  namespace: 'default',
  name: 'admins',
  description: 'Admin role',
  owner: 'user:default/owner',
  selectedMembers: [userMember, groupMember],
  selectedPlugins: [{ label: 'Catalog', value: 'catalog' }],
  permissionPoliciesRows: [
    catalogReadRow,
    conditionalRow(1, 'keep'),
    conditionalRow(2, 'remove-me'),
  ],
};

describe('getRoleChanges', () => {
  it('reports no changes when the values are unchanged', () => {
    const changes = getRoleChanges(initialValues, { ...initialValues });

    expect(changes.detailChanges).toEqual([]);
    expect(changes.addedMembers).toEqual([]);
    expect(changes.removedMembers).toEqual([]);
    expect(changes.addedPermissions).toEqual([]);
    expect(changes.removedPermissions).toEqual([]);
    expect(changes.addedConditions).toEqual([]);
    expect(changes.removedConditions).toEqual([]);
    expect(changes.changedConditions).toEqual([]);
    expect(changes.previousRole).toEqual(changes.currentRole);
  });

  it('treats a missing and an empty description as the same value', () => {
    const changes = getRoleChanges(
      { ...initialValues, description: undefined },
      { ...initialValues, description: '' },
    );

    expect(changes.detailChanges).toEqual([]);
  });

  it('does not report owner changes, which the backend drops on save', () => {
    const changes = getRoleChanges(initialValues, {
      ...initialValues,
      owner: 'user:default/someone-else',
    });

    expect(changes.detailChanges).toEqual([]);
  });

  it('reports every kind of change together', () => {
    const values: RoleFormValues = {
      ...initialValues,
      description: 'Updated description',
      owner: '',
      selectedMembers: [groupMember, newMember],
      permissionPoliciesRows: [
        catalogCreateRow,
        conditionalRow(1, 'edited'),
        conditionalRow(undefined, 'brand-new'),
      ],
    };

    const changes = getRoleChanges(initialValues, values);

    expect(changes.detailChanges).toEqual([
      {
        field: 'description',
        previous: 'Admin role',
        current: 'Updated description',
      },
    ]);
    expect(changes.addedMembers).toEqual([newMember]);
    expect(changes.removedMembers).toEqual([userMember]);
    expect(changes.addedPermissions).toEqual([
      {
        entityReference: 'role:default/admins',
        permission: 'catalog.entity.create',
        policy: 'create',
        effect: 'allow',
      },
    ]);
    expect(changes.removedPermissions).toEqual([
      {
        entityReference: 'role:default/admins',
        permission: 'catalog.entity.read',
        policy: 'read',
        effect: 'allow',
      },
    ]);
    expect(changes.addedConditions).toEqual([
      expect.objectContaining({
        pluginId: 'catalog',
        roleEntityRef: 'role:default/admins',
        conditions: expect.objectContaining({ params: { label: 'brand-new' } }),
      }),
    ]);
    expect(changes.removedConditions).toEqual([
      { id: 2, row: conditionalRow(2, 'remove-me') },
    ]);
    expect(changes.changedConditions).toEqual([
      {
        id: 1,
        updateCondition: expect.objectContaining({
          conditions: expect.objectContaining({ params: { label: 'edited' } }),
        }),
      },
    ]);
    expect(changes.currentRole.memberReferences).toEqual([
      'group:default/team-a',
      'user:default/bob',
    ]);
  });

  it('does not report policies as removed and re-added when only the role is renamed', () => {
    const values: RoleFormValues = {
      ...initialValues,
      name: 'platform-admins',
    };

    const changes = getRoleChanges(initialValues, values);

    expect(changes.previousRole.name).toBe('role:default/admins');
    expect(changes.currentRole.name).toBe('role:default/platform-admins');
    expect(changes.detailChanges).toEqual([
      { field: 'name', previous: 'admins', current: 'platform-admins' },
    ]);
    expect(changes.addedPermissions).toEqual([]);
    expect(changes.removedPermissions).toEqual([]);
    // The backend moves the conditional policies to the new ref during the
    // role update, so a pure rename sends no condition updates.
    expect(changes.changedConditions).toEqual([]);
  });

  it('diffs a conditional policy spanning several rows as one policy', () => {
    const rowA = conditionalRow(7, 'multi');
    const rowB: PermissionsData = {
      ...conditionalRow(7, 'multi'),
      permission: 'catalog.entity.read',
      policies: [{ policy: 'Read', effect: 'allow' }],
    };
    const multiRowValues: RoleFormValues = {
      ...initialValues,
      permissionPoliciesRows: [rowA, rowB],
    };

    const unchanged = getRoleChanges(multiRowValues, { ...multiRowValues });
    expect(unchanged.changedConditions).toEqual([]);

    const changes = getRoleChanges(multiRowValues, {
      ...multiRowValues,
      permissionPoliciesRows: [
        conditionalRow(7, 'edited'),
        { ...rowB, conditions: conditionalRow(7, 'edited').conditions },
      ],
    });
    expect(changes.changedConditions).toEqual([
      {
        id: 7,
        updateCondition: expect.objectContaining({
          permissionMapping: [
            { name: 'catalog.entity.delete', action: 'delete' },
            { name: 'catalog.entity.read', action: 'read' },
          ],
        }),
      },
    ]);
  });

  it('ignores key order when deciding whether a conditional policy changed', () => {
    const reordered: PermissionsData = {
      ...conditionalRow(1, 'keep'),
      conditions: {
        condition: {
          params: { label: 'keep' },
          resourceType: 'catalog-entity',
          rule: 'HAS_LABEL',
        },
      },
    };
    const changes = getRoleChanges(initialValues, {
      ...initialValues,
      permissionPoliciesRows: [
        catalogReadRow,
        reordered,
        conditionalRow(2, 'remove-me'),
      ],
    });

    expect(changes.changedConditions).toEqual([]);
  });
});
