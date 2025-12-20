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
import { Knex } from 'knex';
import { Settings, DEFAULT_SETTINGS } from '../types';

/**
 * @internal
 */
type DbSettings = Settings & { id: string };

/**
 * Database implementation for announcement settings
 *
 * @internal
 */
export class SettingsDatabase {
  constructor(private readonly db: Knex) {}

  private defaultSettings: Settings = DEFAULT_SETTINGS;

  async get(): Promise<Settings> {
    const settings = await this.db<DbSettings>('settings').first();
    if (!settings) {
      return this.defaultSettings;
    }
    // Exclude id from the returned Settings object
    const { id, ...settingsWithoutId } = settings;
    return settingsWithoutId;
  }

  async update(settings: Settings): Promise<void> {
    await this.db<DbSettings>('settings')
      .where('id', 'default')
      .update(settings);
  }

  async reset(): Promise<void> {
    await this.db<DbSettings>('settings').truncate();
    await this.db<DbSettings>('settings').insert({
      id: 'default',
      ...this.defaultSettings,
    });
  }
}
