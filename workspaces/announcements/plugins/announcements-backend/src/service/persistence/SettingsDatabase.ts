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

    console.log('Settings loaded:', this.values);
  }

  /**
   * Get a single setting value by key.
   */
  get<K extends keyof Settings>(key: K): Settings[K] {
    if (!this.values) {
      throw new Error('Settings not loaded. Call load() first.');
    }
    return this.values[key];
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
   * Set a single setting value.
   */
  async set<K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ): Promise<void> {
    if (!this.values) {
      throw new Error('Settings not loaded. Call load() first.');
    }

    // Validate the individual setting
    settingsSchema.shape[key].parse(value);

    await this.db('settings')
      .insert({ key, value, updated_at: this.db.fn.now() })
      .onConflict('key')
      .merge(['value', 'updated_at']);

    this.values[key] = value;
  }

  /**
   * Update multiple settings at once.
   */
  async update(settings: Partial<Settings>): Promise<void> {
    if (!this.values) {
      throw new Error('Settings not loaded. Call load() first.');
    }

    console.log('Updating settings:', settings);

    const entries = Object.entries(settings) as [
      keyof Settings,
      Settings[keyof Settings],
    ][];

    console.log('Updating settings:', entries);

    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  }

  /**
   * Reset all settings to defaults.
   */
  async reset(): Promise<void> {
    await this.db('settings').truncate();
    this.values = settingsSchema.parse({});
  }
}
