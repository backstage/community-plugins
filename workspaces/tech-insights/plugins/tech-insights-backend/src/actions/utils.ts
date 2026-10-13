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
  BackstageCredentials,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { InputError, NotAllowedError, stringifyError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';

/**
 * Throws a NotAllowedError unless the caller is allowed to use the permission.
 */
export const authorize = async (
  permissions: PermissionsService,
  credentials: BackstageCredentials,
  permission: BasicPermission,
) => {
  const [decision] = await permissions.authorize([{ permission }], {
    credentials,
  });

  // BasicPermission decisions must be ALLOW; CONDITIONAL is only valid for
  // resource permissions evaluated against a resourceRef, which isn't done here.
  if (decision.result !== AuthorizeResult.ALLOW) {
    throw new NotAllowedError('Unauthorized');
  }
};

/**
 * Normalizes an entity ref string, turning parse failures into an InputError
 * so that callers get a client error instead of an internal one.
 */
export const toEntityRef = (entity: string): string => {
  try {
    return stringifyEntityRef(parseEntityRef(entity));
  } catch (error) {
    throw new InputError(
      `Invalid entity ref '${entity}': ${stringifyError(error)}`,
    );
  }
};
