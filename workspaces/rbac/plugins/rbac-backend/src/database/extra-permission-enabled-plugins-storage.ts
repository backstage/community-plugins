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
import { Knex } from 'knex';

// todo rename Entity to dto.
export interface ExtraPermissionEnabledPluginEntity {
  pluginId: string;
}

export interface ExtraPermissionEnabledPluginsStorage {
  // Fetches the extra plugin list from database.
  // This list contains information about extra plugins that supports Backstage permissions framework.
  getPlugins(): Promise<ExtraPermissionEnabledPluginEntity[]>;

  // Adds the plugins to the database.
  addPlugins(plugins: ExtraPermissionEnabledPluginEntity[]): Promise<void>;

  // Removes plugins from the database by pluginIds.
  deletePlugins(pluginIds: string[]): Promise<void>;
}

export class DataBaseExtraPermissionEnabledPluginsStorage
  implements ExtraPermissionEnabledPluginsStorage
{
  private readonly CONDITIONAL_TABLE = 'extra_permission_enabled_plugins';

  public constructor(private readonly knex: Knex<any, any[]>) {}

  async getPlugins(): Promise<ExtraPermissionEnabledPluginEntity[]> {
    return await this.knex
      .table(this.CONDITIONAL_TABLE)
      .select<ExtraPermissionEnabledPluginEntity[]>('pluginId');
  }

  async addPlugins(
    plugins: ExtraPermissionEnabledPluginEntity[],
  ): Promise<void> {
    await this.knex
      .table(this.CONDITIONAL_TABLE)
      .insert(plugins)
      .onConflict('pluginId')
      .ignore();
  }

  async deletePlugins(pluginIds: string[]): Promise<void> {
    await this.knex
      .table(this.CONDITIONAL_TABLE)
      .whereIn('pluginId', pluginIds)
      .delete()
      .onConflict('pluginId')
      .ignore();
  }
}
