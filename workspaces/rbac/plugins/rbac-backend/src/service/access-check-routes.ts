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
  AuditorService,
  AuthService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';
import { InputError, NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import express from 'express';

import { policyEntityReadPermission } from '@backstage-community/plugin-rbac-common';

import { logAuditorEvent } from '../auditor/rest-interceptor';
import { validateEntityReference } from '../validation/policies-validation';
import { AccessCheckService } from './access-check';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { authorizeConditional } from './policies-rest-api';

export function registerAccessCheckRoutes(
  router: express.Router,
  accessCheck: AccessCheckService,
  pluginPermMetaData: PluginPermissionMetadataCollector,
  deps: {
    auth: AuthService;
    httpAuth: HttpAuthService;
    auditor: AuditorService;
    permissions: PermissionsService;
  },
) {
  const { auth, auditor } = deps;

  router.get(
    '/access-check',
    logAuditorEvent(auditor),
    async (request, response) => {
      const { decision } = await authorizeConditional(
        request,
        policyEntityReadPermission,
        deps,
      );
      // The access check aggregates policies across every role, while a
      // conditional read decision scopes the caller to the roles they own.
      // Answering a scoped caller would leak the policies of other owners.
      if (decision.result === AuthorizeResult.CONDITIONAL) {
        throw new NotAllowedError(
          `The access check requires unrestricted '${policyEntityReadPermission.name}' access`,
        );
      }

      const userEntityRefQuery = request.query.userEntityRef;
      if (typeof userEntityRefQuery !== 'string') {
        throw new InputError(
          `Missing required query parameter 'userEntityRef'`,
        );
      }
      // Role members are stored lowercased, so normalize the same way.
      const userEntityRef = userEntityRefQuery.toLocaleLowerCase('en-US');
      const err = validateEntityReference(userEntityRef);
      if (err) {
        throw new InputError(err.message);
      }
      const { kind } = parseEntityRef(userEntityRef);
      if (kind !== 'user') {
        throw new InputError(
          `Unsupported kind ${kind}. Supported value should be "user"`,
        );
      }

      const pluginPolicies = await pluginPermMetaData.getPluginPolicies(auth);
      const body = await accessCheck.checkAccess(userEntityRef, pluginPolicies);
      response.json(body);
    },
  );
}
