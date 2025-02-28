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
import { CompoundEntityRef, parseEntityRef } from '@backstage/catalog-model';
import { NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { Enforcer } from 'casbin';

import {
  isValidPermissionAction,
  PermissionActionValues,
  Role,
  RoleBasedPolicy,
  Source,
} from '@backstage-community/plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';

/**
 * validateSource validates the source to the role that is being modified. This includes comparing the source from the
 * originating role to the source that the modification is coming from.
 * We do this to ensure consistency between permissions and roles and where they are originally defined.
 * This is a strict comparison where the source of all new roles (grouping policies) and permissions must match
 * the source of the first role that was created.
 * We are not strict for permission policies defined with an originating role source of configuration.
 * @param source The source in which the modification is coming from
 * @param roleMetadata The original role that was created
 * @returns An error in the event that the source does not match the originating role
 */
export const validateSource = async (
  source: Source,
  roleMetadata: RoleMetadataDao | undefined,
): Promise<Error | undefined> => {
  if (!roleMetadata) {
    return undefined; // Role does not exist yet, there is no conflict with the source
  }

  if (roleMetadata.source !== source && roleMetadata.source !== 'legacy') {
    return new Error(
      `source does not match originating role ${
        roleMetadata.roleEntityRef
      }, consider making changes to the '${roleMetadata.source.toLocaleUpperCase()}'`,
    );
  }

  return undefined;
};

// This should be called on add and edit and delete
export function validatePolicy(policy: RoleBasedPolicy): Error | undefined {
  const err = validateEntityReference(policy.entityReference);
  if (err) {
    return err;
  }

  if (!policy.permission) {
    return new Error(`'permission' field must not be empty`);
  }

  if (!policy.policy) {
    return new Error(`'policy' field must not be empty`);
  } else if (!isValidPermissionAction(policy.policy)) {
    return new Error(
      `'policy' has invalid value: '${
        policy.policy
      }'. It should be one of: ${PermissionActionValues.join(', ')}`,
    );
  }

  if (!policy.effect) {
    return new Error(`'effect' field must not be empty`);
  } else if (!isValidEffectValue(policy.effect)) {
    return new Error(
      `'effect' has invalid value: '${
        policy.effect
      }'. It should be: '${AuthorizeResult.ALLOW.toLocaleLowerCase()}' or '${AuthorizeResult.DENY.toLocaleLowerCase()}'`,
    );
  }

  return undefined;
}

export function validateRole(role: Role): Error | undefined {
  if (!role.name) {
    return new Error(`'name' field must not be empty`);
  }

  let err = validateEntityReference(role.name, true);
  if (err) {
    return err;
  }

  if (!role.memberReferences || role.memberReferences.length === 0) {
    return new Error(`'memberReferences' field must not be empty`);
  }

  for (const member of role.memberReferences) {
    err = validateEntityReference(member);
    if (err) {
      return err;
    }
  }
  return undefined;
}

function isValidEffectValue(effect: string): boolean {
  return (
    effect === AuthorizeResult.ALLOW.toLocaleLowerCase() ||
    effect === AuthorizeResult.DENY.toLocaleLowerCase()
  );
}

function isValidEntityName(name: string): boolean {
  const validNamePattern = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
  return validNamePattern.test(name) && name.length <= 63;
}

function isValidEntityNamespace(namespace: string): boolean {
  const validNamespacePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return validNamespacePattern.test(namespace) && namespace.length <= 63;
}

// We supports only full form entity reference: [<kind>:][<namespace>/]<name>
export function validateEntityReference(
  entityRef?: string,
  role?: boolean,
): Error | undefined {
  if (!entityRef) {
    return new Error(`'entityReference' must not be empty`);
  }

  let entityRefCompound: CompoundEntityRef;
  try {
    entityRefCompound = parseEntityRef(entityRef);
  } catch (err) {
    return err as Error;
  }

  const entityRefFull = `${entityRefCompound.kind}:${entityRefCompound.namespace}/${entityRefCompound.name}`;
  if (entityRefFull !== entityRef) {
    return new Error(
      `entity reference '${entityRef}' does not match the required format [<kind>:][<namespace>/]<name>. Provide, please, full entity reference.`,
    );
  }

  if (role && entityRefCompound.kind !== 'role') {
    return new Error(
      `Unsupported kind ${entityRefCompound.kind}. Supported value should be "role"`,
    );
  }

  if (
    entityRefCompound.kind !== 'user' &&
    entityRefCompound.kind !== 'group' &&
    entityRefCompound.kind !== 'role'
  ) {
    return new Error(
      `Unsupported kind ${entityRefCompound.kind}. List supported values ["user", "group", "role"]`,
    );
  }

  if (!isValidEntityName(entityRefCompound.name)) {
    return new Error(
      `The name '${entityRefCompound.name}' in the entity reference must be a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total`,
    );
  }

  if (!isValidEntityNamespace(entityRefCompound.namespace)) {
    return new Error(
      `The namespace '${entityRefCompound.namespace}' in the entity reference must be a string that is sequences of [a-z0-9] separated by [-], at most 63 characters in total`,
    );
  }

  return undefined;
}

export async function validateGroupingPolicy(
  groupPolicy: string[],
  metadata: RoleMetadataDao | undefined,
  source: Source,
): Promise<Error | undefined> {
  if (groupPolicy.length !== 2) {
    return new Error(`Group policy should have length 2`);
  }

  const member = groupPolicy[0];
  let err = validateEntityReference(member);
  if (err) {
    return new Error(
      `Failed to validate group policy ${groupPolicy}. Cause: ${err.message}`,
    );
  }
  const parent = groupPolicy[1];
  err = validateEntityReference(parent);
  if (err) {
    return new Error(
      `Failed to validate group policy ${groupPolicy}. Cause: ${err.message}`,
    );
  }
  if (member.startsWith(`role:`)) {
    return new Error(
      `Group policy is invalid: ${groupPolicy}. rbac-backend plugin doesn't support role inheritance.`,
    );
  }
  if (member.startsWith(`group:`) && parent.startsWith(`group:`)) {
    return new Error(
      `Group policy is invalid: ${groupPolicy}. Group inheritance information could be provided only with help of Catalog API.`,
    );
  }
  if (member.startsWith(`user:`) && parent.startsWith(`group:`)) {
    return new Error(
      `Group policy is invalid: ${groupPolicy}. User membership information could be provided only with help of Catalog API.`,
    );
  }

  err = await validateSource(source, metadata);
  if (metadata && err) {
    return new NotAllowedError(
      `Unable to validate role ${groupPolicy}. Cause: ${err.message}`,
    );
  }

  return undefined;
}

export const checkForDuplicatePolicies = async (
  fileEnf: Enforcer,
  policy: string[],
  policyFile: string,
): Promise<Error | undefined> => {
  const duplicates = await fileEnf.getFilteredPolicy(0, ...policy);
  if (duplicates.length > 1) {
    return new Error(
      `Duplicate policy: ${policy} found in the file ${policyFile}`,
    );
  }

  const flipPolicyEffect = [
    policy[0],
    policy[1],
    policy[2],
    policy[3] === 'deny' ? 'allow' : 'deny',
  ];

  // Check if the same policy exists but with a different effect
  const dupWithDifferentEffect = await fileEnf.getFilteredPolicy(
    0,
    ...flipPolicyEffect,
  );

  if (dupWithDifferentEffect.length > 0) {
    return new Error(
      `Duplicate policy: ${policy[0]}, ${policy[1]}, ${policy[2]} with different effect found in the file ${policyFile}`,
    );
  }

  return undefined;
};

export const checkForDuplicateGroupPolicies = async (
  fileEnf: Enforcer,
  policy: string[],
  policyFile: string,
): Promise<Error | undefined> => {
  const duplicates = await fileEnf.getFilteredGroupingPolicy(0, ...policy);

  if (duplicates.length > 1) {
    return new Error(
      `Duplicate role: ${policy} found in the file ${policyFile}`,
    );
  }
  return undefined;
};
