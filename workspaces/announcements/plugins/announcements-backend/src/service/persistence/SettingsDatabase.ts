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
import { Settings, SettingsStore, settingsSchema } from '../types';
import { ANNOUNCEMENTS_SETTINGS_DEFAULT } from './constants';

/**
 * Database implementation for announcements settings using key-value storage
 *
 * @internal
 */
export class SettingsDatabase implements SettingsStore {
  private values: Settings | null = null;

  constructor(private readonly db: Knex) {}

  /**
   * Load settings from the database into memory.
   * Must be called before accessing settings.
   */
  async load(): Promise<void> {
    const rows = await this.db('settings').select('key', 'value');

    const raw = rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, unknown>);

    this.values = settingsSchema.parse(raw);
  }

  /**
   * Get all settings.
   */
  getAll(): Settings {
    if (!this.values) {
      throw new Error('Settings not loaded. Call load() first.');
    }
    return { ...this.values };
  }

  /**
   * Update multiple settings at once within a transaction.
   */
  async update(settings: Partial<Settings>): Promise<void> {
    if (!this.values) {
      throw new Error('Settings not loaded. Call load() first.');
    }

    const entries = Object.entries(settings) as [
      keyof Settings,
      Settings[keyof Settings],
    ][];

    // Validate all settings before starting the transaction
    for (const [key, value] of entries) {
      settingsSchema.shape[key].parse(value);
    }

    await this.db.transaction(async trx => {
      for (const [key, value] of entries) {
        await trx('settings')
          .insert({ key, value, updated_at: trx.fn.now() })
          .onConflict('key')
          .merge(['value', 'updated_at']);
      }
    });

    // Update in-memory cache only after transaction succeeds
    this.values = { ...this.values, ...settings };
  }

  /**
   * Reset all settings to defaults within a transaction.
   */
  async reset(): Promise<void> {
    await this.db.transaction(async trx => {
      await trx('settings').del();
      await trx('settings').insert(
        Object.entries(ANNOUNCEMENTS_SETTINGS_DEFAULT).map(([key, value]) => ({
          key,
          value,
          updated_at: trx.fn.now(),
        })),
      );
    });

    this.values = ANNOUNCEMENTS_SETTINGS_DEFAULT;
  }
}
