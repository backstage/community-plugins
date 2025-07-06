/*
 * Copyright 2025 The Backstage Authors
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
  PermissionDependentPluginList,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityReadPermission,
} from '@backstage-community/plugin-rbac-common';
import { logAuditorEvent } from '../auditor/rest-interceptor';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import {
  PermissionDependentPluginDTO,
  PermissionDependentPluginStore,
} from '../database/extra-permission-enabled-plugins-storage';
import { authorizeConditional } from './policies-rest-api';
import {
  AuditorService,
  AuthService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { ExtendablePluginIdProvider } from './extendable-id-provider';
import {
  ConflictError,
  NotAllowedError,
  NotFoundError,
} from '@backstage/errors';
import { validatePermissionDependentPlugin } from '../validation/plugin-validation';
import express from 'express';

export function registerPermissionDefinitionRoutes(
  router: express.Router,
  pluginPermMetaData: PluginPermissionMetadataCollector,
  pluginIdProvider: ExtendablePluginIdProvider,
  extraPluginsIdStorage: PermissionDependentPluginStore,
  deps: {
    auth: AuthService;
    httpAuth: HttpAuthService;
    auditor: AuditorService;
    permissions: PermissionsService;
  },
) {
  const { auth, auditor } = deps;

  router.get(
    '/plugins/policies',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityReadPermission, deps);

      const body = await pluginPermMetaData.getPluginPolicies(auth);

      response.json(body);
    },
  );

  router.get(
    '/plugins/condition-rules',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityReadPermission, deps);

      const body = await pluginPermMetaData.getPluginConditionRules(auth);

      response.json(body);
    },
  );

  router.get(
    '/plugins/id',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityReadPermission, deps);

      const actualPluginIds = await pluginIdProvider.getPluginIds();
      response.status(200).json(pluginIdsToResponse(actualPluginIds));
    },
  );

  router.post(
    '/plugins/id',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityCreatePermission, deps);
      const pluginIds: PermissionDependentPluginList = request.body;
      validatePermissionDependentPlugin(pluginIds);
      const pluginDtos = permissionDependentPluginListToDTO(pluginIds);

      let actualPluginIds = await pluginIdProvider.getPluginIds();
      const conflictedIds = pluginIds.ids.filter(id =>
        actualPluginIds.includes(id),
      );
      if (conflictedIds.length > 0) {
        throw new ConflictError(
          `Plugin IDs ${JSON.stringify(conflictedIds)} already exist in the system. Please use a different set of plugin ids.`,
        );
      }
      await extraPluginsIdStorage.addPlugins(pluginDtos);
      response.locals.meta = pluginIds;

      actualPluginIds = await pluginIdProvider.getPluginIds();
      response.status(200).json(pluginIdsToResponse(actualPluginIds));
    },
  );

  router.delete(
    '/plugins/id',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityDeletePermission, deps);
      const pluginIds: PermissionDependentPluginList = request.body;
      validatePermissionDependentPlugin(pluginIds);
      const configuredPluginIds = pluginIds.ids.filter(pluginId =>
        pluginIdProvider.isConfiguredPluginId(pluginId),
      );
      if (configuredPluginIds.length > 0) {
        throw new NotAllowedError(
          `Plugin IDs ${JSON.stringify(pluginIds.ids)} can be removed only with help of configuration.`,
        );
      }

      let actualPluginIds = await pluginIdProvider.getPluginIds();
      const notFoundPlugins = pluginIds.ids.filter(
        pluginToDel => !actualPluginIds.includes(pluginToDel),
      );
      if (notFoundPlugins.length > 0) {
        throw new NotFoundError(
          `Plugin IDs ${JSON.stringify(notFoundPlugins)} were not found.`,
        );
      }

      await extraPluginsIdStorage.deletePlugins(pluginIds.ids);
      response.locals.meta = pluginIds;

      actualPluginIds = await pluginIdProvider.getPluginIds();
      response.status(200).json(pluginIdsToResponse(actualPluginIds));
    },
  );
}

export function pluginIdsToResponse(
  pluginIds: string[],
): PermissionDependentPluginList {
  return { ids: pluginIds };
}

export function permissionDependentPluginListToDTO(
  pluginList: PermissionDependentPluginList,
): PermissionDependentPluginDTO[] {
  return pluginList.ids.map(pluginId => {
    return { pluginId };
  });
}
