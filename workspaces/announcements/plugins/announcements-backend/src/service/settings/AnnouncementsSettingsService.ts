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

import { SettingsDatabase } from '../persistence/SettingsDatabase';
import { Settings, SettingsStore } from '../types';

/**
 * Service to manage announcement settings
 *
 * @public
 */
export class AnnouncementsSettingsService implements SettingsStore {
  constructor(private readonly db: SettingsDatabase) {}

  async get(): Promise<Settings> {
    return await this.db.get();
  }

  async update(settings: Partial<Settings>): Promise<void> {
    const currentSettings = await this.get();

    const updatedSettings: Settings = {
      ...currentSettings,
      ...settings,
    };

    await this.db.update(updatedSettings);
  }

  async reset(): Promise<void> {
    await this.db.reset();
  }
}
