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
import { z } from 'zod';

/**
 * Zod schema for announcements settings validation
 */
export const settingsSchema = z.object({
  maxPerPage: z
    .number()
    .int('maxPerPage must be an integer')
    .positive('maxPerPage must be a positive number')
    .min(1, 'maxPerPage must be at least 1')
    .max(100, 'maxPerPage must not exceed 100')
    .default(10),
  showInactiveAnnouncements: z
    .boolean({
      required_error: 'showInactiveAnnouncements is required',
      invalid_type_error: 'showInactiveAnnouncements must be a boolean',
    })
    .default(false),
});

/**
 * Announcements settings
 */
export type Settings = z.infer<typeof settingsSchema>;

/**
 * Zod schema for partial announcements settings updates
 *
 * @remarks
 * Allows updating individual announcements settings fields
 */
export const partialSettingsSchema = settingsSchema.partial();

/**
 * Announcements settings store operations
 */
export interface SettingsStore {
  get<K extends keyof Settings>(key: K): Settings[K];
  getAll(): Settings;
  set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
  update(settings: Partial<Settings>): Promise<void>;
  reset(): Promise<void>;
}
