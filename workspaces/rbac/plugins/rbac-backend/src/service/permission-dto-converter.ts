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
import { PermissionDependentPluginList } from '@backstage-community/plugin-rbac-common';
import { PermissionDependentPluginDTO } from '../database/extra-permission-enabled-plugins-storage';

export function permissionDependentPluginListToDTO(
  pluginList: PermissionDependentPluginList,
): PermissionDependentPluginDTO[] {
  return pluginList.ids.map(pluginId => {
    return { pluginId };
  });
}

export function dtoToPermissionDependentPluginList(
  dao: PermissionDependentPluginDTO[],
): PermissionDependentPluginList {
  return {
    ids: dao.map(item => item.pluginId),
  };
}

// todo: refactor another database DAO to directly use their own DTO instead of Response objects.
