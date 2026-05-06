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
import { InputError } from '@backstage/errors';

const MAX_PLUGIN_IDS = 100;
const MAX_PLUGIN_ID_LENGTH = 64;

export function validatePermissionDependentPlugin(
  plugin: PermissionDependentPluginList,
) {
  if (!plugin.ids) {
    throw new InputError(
      `'ids' must be specified in the permission dependent plugin`,
    );
  }
  if (
    !Array.isArray(plugin.ids) ||
    !plugin.ids.every(id => typeof id === 'string')
  ) {
    throw new InputError(`'ids' must be an array of string plugin ID values`);
  }
  if (plugin.ids.length === 0) {
    throw new InputError(`'ids' must contain at least one plugin ID`);
  }
  if (plugin.ids.length > MAX_PLUGIN_IDS) {
    throw new InputError(
      `'ids' can include at most ${MAX_PLUGIN_IDS} plugin IDs`,
    );
  }

  const uniqueIds = new Set<string>();
  for (const id of plugin.ids) {
    if (id.length === 0 || id.length > MAX_PLUGIN_ID_LENGTH) {
      throw new InputError(
        `plugin ID '${id}' must be between 1 and ${MAX_PLUGIN_ID_LENGTH} characters`,
      );
    }
    if (uniqueIds.has(id)) {
      throw new InputError(`'ids' contains duplicate plugin ID '${id}'`);
    }
    uniqueIds.add(id);
  }
}
