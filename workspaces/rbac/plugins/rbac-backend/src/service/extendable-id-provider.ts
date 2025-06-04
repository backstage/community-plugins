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
import { PluginIdProvider } from '@backstage-community/plugin-rbac-node';
import { PermissionDependentPluginStore } from '../database/extra-permission-enabled-plugins-storage';
import type { Config } from '@backstage/config';
import { union } from 'lodash';

export class ExtendablePluginIdProvider {
  // plugin ids which came from application config and PluginIdProvider
  private readonly configurationPluginIds: string[];

  constructor(
    private readonly pluginStore: PermissionDependentPluginStore,
    pluginIdProvider: PluginIdProvider,
    config: Config,
  ) {
    const pluginIdsConfig = config.getOptionalStringArray(
      'permission.rbac.pluginsWithPermission',
    );
    this.configurationPluginIds = pluginIdsConfig
      ? union(pluginIdsConfig, pluginIdProvider.getPluginIds())
      : pluginIdProvider.getPluginIds();
  }

  isConfiguredPluginId(pluginId: string): boolean {
    return this.configurationPluginIds.includes(pluginId);
  }

  async handleConflictedPluginIds(): Promise<void> {
    const conflictedIds = await (
      await this.pluginStore.getPlugins()
    ).filter(pId => this.configurationPluginIds.includes(pId.pluginId));
    await this.pluginStore.deletePlugins(conflictedIds.map(p => p.pluginId));
  }

  async getPluginIds(): Promise<string[]> {
    const extraPlugins = await this.pluginStore.getPlugins();
    return union(
      this.configurationPluginIds,
      extraPlugins.map(plugin => plugin.pluginId),
    );
  }
}
