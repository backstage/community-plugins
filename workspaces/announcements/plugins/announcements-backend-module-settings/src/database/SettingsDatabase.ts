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
import {
  Settings,
  settingsSchema,
} from '@backstage-community/plugin-announcements-common';

const SETTINGS_KEY = 'announcements-plugin';

/**
 * Default settings for the announcements plugin
 */
const ANNOUNCEMENTS_SETTINGS_DEFAULT: Settings = {
  pluginTitle: 'Announcements',
  createAnnouncementAsInactive: false,
  sendNotification: false,
  createAnnouncementWithDefaultCategory: null,
  showInactiveAnnouncements: false,
  showStartAt: false,
  announcementTitleLength: 30,
  tagTitleLength: 20,
  excerptLength: 50,
  maxPerPage: 10,
};

/**
 * Announcements settings store operations
 *
 * @internal
 */
export interface SettingsStore {
  getAll(): Settings;
  update(settings: Partial<Settings>): Promise<void>;
  reset(): Promise<void>;
}

/**
 * Database implementation for announcements settings using single config storage
 *
 * @internal
 */
export class SettingsDatabase implements SettingsStore {
  private constructor(private readonly db: Knex, private values: Settings) {}

  /**
   * Create a SettingsDatabase instance, inserting defaults if no row exists.
   */
  static async withDefaults(db: Knex): Promise<SettingsDatabase> {
    let row = await db('settings').where('key', SETTINGS_KEY).first();

    if (!row) {
      await db('settings').insert({
        key: SETTINGS_KEY,
        value: JSON.stringify(ANNOUNCEMENTS_SETTINGS_DEFAULT),
      });
      row = { value: ANNOUNCEMENTS_SETTINGS_DEFAULT };
    }

    // Parse JSON string if needed (SQLite returns jsonb as string, PostgreSQL as object)
    const rawValue =
      typeof row.value === 'string' ? JSON.parse(row.value) : row.value;

    // Parse through Zod to apply defaults for any new fields
    const values = settingsSchema.parse(rawValue);
    return new SettingsDatabase(db, values);
  }

  /**
   * Get all settings.
   */
  getAll(): Settings {
    return { ...this.values };
  }

  /**
   * Update settings by merging with existing values.
   */
  async update(settings: Partial<Settings>): Promise<void> {
    const merged = settingsSchema.parse({ ...this.values, ...settings });

    await this.db('settings')
      .where('key', SETTINGS_KEY)
      .update({
        value: JSON.stringify(merged),
        updated_at: this.db.fn.now(),
      });

    this.values = merged;
  }

  /**
   * Reset all settings to defaults.
   */
  async reset(): Promise<void> {
    await this.db('settings')
      .where('key', SETTINGS_KEY)
      .update({
        value: JSON.stringify(ANNOUNCEMENTS_SETTINGS_DEFAULT),
        updated_at: this.db.fn.now(),
      });

    this.values = { ...ANNOUNCEMENTS_SETTINGS_DEFAULT };
  }
}
