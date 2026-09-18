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

import {
  ConditionalAliases,
  isResourcedPolicy,
  isValidPermissionAction,
  PermissionActionValues,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityPermissions,
  policyEntityReadPermission,
  policyEntityUpdatePermission,
  RESOURCE_TYPE_POLICY_ENTITY,
  toPermissionAction,
  UnauthorizedError,
} from './index';

describe('rbac-common public contract', () => {
  it('exports stable policy-entity permission names', () => {
    expect(policyEntityReadPermission.name).toBe('policy.entity.read');
    expect(policyEntityCreatePermission.name).toBe('policy.entity.create');
    expect(policyEntityUpdatePermission.name).toBe('policy.entity.update');
    expect(policyEntityDeletePermission.name).toBe('policy.entity.delete');
    expect(policyEntityPermissions).toEqual([
      policyEntityReadPermission,
      policyEntityCreatePermission,
      policyEntityDeletePermission,
      policyEntityUpdatePermission,
    ]);
  });

  it('keeps the policy-entity resource type stable', () => {
    expect(RESOURCE_TYPE_POLICY_ENTITY).toBe('policy-entity');
    expect(policyEntityReadPermission.resourceType).toBe(
      RESOURCE_TYPE_POLICY_ENTITY,
    );
  });

  it('discriminates resourced policies', () => {
    expect(
      isResourcedPolicy({
        name: 'catalog.entity.read',
        policy: 'read',
        resourceType: 'catalog-entity',
      }),
    ).toBe(true);
    expect(
      isResourcedPolicy({
        name: 'policy.entity.read',
        policy: 'read',
      }),
    ).toBe(false);
  });

  it('validates permission actions and maps undefined to use', () => {
    expect(PermissionActionValues).toEqual([
      'create',
      'read',
      'update',
      'delete',
      'use',
    ]);
    expect(isValidPermissionAction('read')).toBe(true);
    expect(isValidPermissionAction('invalid')).toBe(false);
    expect(toPermissionAction({})).toBe('use');
    expect(toPermissionAction({ action: 'delete' })).toBe('delete');
  });

  it('exports conditional alias constants and UnauthorizedError', () => {
    expect(ConditionalAliases.CURRENT_USER).toBe('currentUser');
    expect(ConditionalAliases.OWNER_REFS).toBe('ownerRefs');
    expect(new UnauthorizedError().message).toBe('Unauthorized');
  });
});
