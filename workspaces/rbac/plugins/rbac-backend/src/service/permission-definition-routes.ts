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
import Router from 'express-promise-router';
import { logAuditorEvent, setAuditorError } from '../auditor/rest-interceptor';
import {
  dtoToPermissionDependentPluginList,
  permissionDependentPluginListToDTO,
} from './permission-dto-converter';
import { PluginPermissionMetadataCollector } from './plugin-endpoints';
import { PermissionDependentPluginStore } from '../database/extra-permission-enabled-plugins-storage';
import { authorizeConditional } from './policies-rest-api';
import {
  AuditorService,
  AuthService,
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';

// todo: do we need separated permissions to set up extra plugin ids  ?
export function createPermissionDefinitionRoutes(
  pluginPermMetaData: PluginPermissionMetadataCollector,
  extraPluginsIdStorage: PermissionDependentPluginStore,
  deps: {
    auth: AuthService;
    httpAuth: HttpAuthService;
    auditor: AuditorService;
    permissions: PermissionsService;
  },
) {
  const router = Router();

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

      const actualPluginDtos = await extraPluginsIdStorage.getPlugins();
      const result = dtoToPermissionDependentPluginList(actualPluginDtos);
      response.json(result);
    },
  );

  router.post(
    '/plugins/id',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityCreatePermission, deps);
      const pluginIds: PermissionDependentPluginList = request.body;
      // todo validate pluginIds object
      const pluginDtos = permissionDependentPluginListToDTO(pluginIds);
      await extraPluginsIdStorage.addPlugins(pluginDtos);
      response.locals.meta = pluginIds;
      pluginPermMetaData.setExtraPluginIds(pluginIds.ids);

      const actualPluginDtos = await extraPluginsIdStorage.getPlugins();
      const result = dtoToPermissionDependentPluginList(actualPluginDtos);
      response.status(201).json(result);
    },
  );

  router.delete(
    '/plugins/id',
    logAuditorEvent(auditor),
    async (request, response) => {
      await authorizeConditional(request, policyEntityDeletePermission, deps);
      const pluginIds: PermissionDependentPluginList = request.body;
      // todo validate pluginIds object
      await extraPluginsIdStorage.deletePlugins(pluginIds.ids);
      response.locals.meta = pluginIds;

      const actualPluginDtos = await extraPluginsIdStorage.getPlugins();
      pluginPermMetaData.setExtraPluginIds(
        actualPluginDtos.map(dto => dto.pluginId),
      );
      const result = dtoToPermissionDependentPluginList(actualPluginDtos);
      response.status(200).json(result);
    },
  );

  router.use(setAuditorError());

  return router;
}
