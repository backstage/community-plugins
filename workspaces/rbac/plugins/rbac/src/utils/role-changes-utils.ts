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
import { Role, RoleBasedPolicy } from '@backstage-community/plugin-rbac-common';

import { RoleFormValues, SelectedMember } from '../components/CreateRole/types';
import {
  PermissionsData,
  RoleBasedConditions,
  UpdatedConditionsData,
} from '../types';
import {
  getNewConditionalPolicies,
  getPermissionPoliciesData,
  getRemovedConditionalPoliciesIds,
  getRoleData,
  getUpdatedConditionalPolicies,
} from './create-role-utils';
import { isSamePermissionPolicy, onlyInLeft } from './rbac-utils';

export type RoleDetailField = 'name' | 'description';

export type RoleDetailChange = {
  field: RoleDetailField;
  previous: string;
  current: string;
};

export type RemovedConditionalPolicy = {
  id: number;
  row: PermissionsData;
};

/**
 * Everything that saving the edited role changes, compared to the role as it
 * was loaded. The same object drives both the review step summary and the
 * requests sent on save.
 */
export type RoleChanges = {
  previousRole: Role;
  currentRole: Role;
  detailChanges: RoleDetailChange[];
  addedMembers: SelectedMember[];
  removedMembers: SelectedMember[];
  addedPermissions: RoleBasedPolicy[];
  removedPermissions: RoleBasedPolicy[];
  addedConditions: RoleBasedConditions[];
  removedConditions: RemovedConditionalPolicy[];
  /** Existing conditional policies whose content differs from the loaded role. */
  changedConditions: UpdatedConditionsData;
};

const getDetailChanges = (
  initialValues: RoleFormValues,
  values: RoleFormValues,
): RoleDetailChange[] => {
  // The owner field is not diffed: the backend excludes owner from its own
  // comparison and answers 204 without saving an owner-only edit.
  const fields: RoleDetailField[] = ['name', 'description'];
  return fields
    .map(field => ({
      field,
      previous: initialValues[field] ?? '',
      current: values[field] ?? '',
    }))
    .filter(({ previous, current }) => previous !== current);
};

const isSameMember = (a: SelectedMember, b: SelectedMember) => a.ref === b.ref;

const getRemovedConditions = (
  initialValues: RoleFormValues,
  values: RoleFormValues,
): RemovedConditionalPolicy[] => {
  const removedIds = new Set(
    getRemovedConditionalPoliciesIds(values, initialValues),
  );
  return initialValues.permissionPoliciesRows.flatMap(row =>
    row.id && removedIds.has(row.id) ? [{ id: row.id, row }] : [],
  );
};

const toStableJson = (condition: RoleBasedConditions): string =>
  JSON.stringify(condition, (_key: string, value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).sort(([a], [b]) => a.localeCompare(b)),
        )
      : value,
  );

// Passing the same values twice builds the save payload for every existing
// (already persisted) conditional policy, keyed by its id.
const getConditionsById = (
  values: RoleFormValues,
): Map<number, RoleBasedConditions> =>
  new Map(
    getUpdatedConditionalPolicies(values, values).map(
      ({ id, updateCondition }) => [id, updateCondition],
    ),
  );

/**
 * Computes the difference between the role as it was loaded and the values
 * currently in the edit form.
 *
 * The backend moves permission and conditional policies to the new entity
 * reference when a role is renamed, so the previous policies are compared as
 * if they already belonged to the current role name. A rename on its own is
 * therefore not reported as every policy being removed and added again.
 */
export const getRoleChanges = (
  initialValues: RoleFormValues,
  values: RoleFormValues,
): RoleChanges => {
  const initialValuesWithCurrentRef: RoleFormValues = {
    ...initialValues,
    kind: values.kind,
    namespace: values.namespace,
    name: values.name,
  };

  const previousPermissions = getPermissionPoliciesData(
    initialValuesWithCurrentRef,
  );
  const currentPermissions = getPermissionPoliciesData(values);

  const previousConditions = getConditionsById(initialValuesWithCurrentRef);
  const updatedConditions = getUpdatedConditionalPolicies(
    values,
    initialValues,
  );

  return {
    previousRole: getRoleData(initialValues),
    currentRole: getRoleData(values),
    detailChanges: getDetailChanges(initialValues, values),
    addedMembers: onlyInLeft(
      values.selectedMembers,
      initialValues.selectedMembers,
      isSameMember,
    ),
    removedMembers: onlyInLeft(
      initialValues.selectedMembers,
      values.selectedMembers,
      isSameMember,
    ),
    addedPermissions: onlyInLeft(
      currentPermissions,
      previousPermissions,
      isSamePermissionPolicy,
    ),
    removedPermissions: onlyInLeft(
      previousPermissions,
      currentPermissions,
      isSamePermissionPolicy,
    ),
    addedConditions: getNewConditionalPolicies(values),
    removedConditions: getRemovedConditions(initialValues, values),
    changedConditions: updatedConditions.filter(({ id, updateCondition }) => {
      const previous = previousConditions.get(id);
      return (
        !previous || toStableJson(previous) !== toStableJson(updateCondition)
      );
    }),
  };
};
