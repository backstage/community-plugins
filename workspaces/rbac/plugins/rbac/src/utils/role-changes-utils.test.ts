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
const conditionalRow = (
  id: number | undefined,
  label: string,
): PermissionsData => ({
  id,
  plugin: 'catalog',
  permission: 'catalog.entity.delete',
  resourceType: 'catalog-entity',
  isResourced: true,
  policies: [{ policy: 'Delete', effect: 'allow' }],
  conditions: {
    condition: {
      rule: 'HAS_LABEL',
      resourceType: 'catalog-entity',
      params: { label },
    },
  },
});

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
    // Existing conditional policies are always re-sent on save.
    expect(changes.updatedConditions.map(({ id }) => id)).toEqual([1, 2]);
    expect(changes.previousRole).toEqual(changes.currentRole);
  });

  it('treats a missing and an empty description or owner as the same value', () => {
    const changes = getRoleChanges(
      { ...initialValues, description: undefined, owner: undefined },
      { ...initialValues, description: '', owner: '' },
    );

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
      { field: 'owner', previous: 'user:default/owner', current: '' },
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
    expect(changes.updatedConditions.map(({ id }) => id)).toEqual([1]);
    expect(changes.changedConditions).toEqual(changes.updatedConditions);
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
    expect(changes.changedConditions).toEqual([]);
    expect(
      changes.updatedConditions.map(
        ({ updateCondition }) => updateCondition.roleEntityRef,
      ),
    ).toEqual(['role:default/platform-admins', 'role:default/platform-admins']);
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
