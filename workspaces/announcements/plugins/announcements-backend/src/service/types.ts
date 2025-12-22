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
  showStartAt: z
    .boolean({
      required_error: 'showStartAt is required',
      invalid_type_error: 'showStartAt must be a boolean',
    })
    .default(false),
  createAnnouncementAsInactiveByDefault: z
    .boolean({
      required_error: 'createAnnouncementAsInactiveByDefault is required',
      invalid_type_error:
        'createAnnouncementAsInactiveByDefault must be a boolean',
    })
    .default(false),
  pluginTitle: z.string().default('Announcements'),
  announcementTitleLength: z
    .number()
    .int('announcementTitleLength must be an integer')
    .positive('announcementTitleLength must be a positive number')
    .min(1, 'announcementTitleLength must be at least 1')
    .max(100, 'announcementTitleLength must not exceed 100')
    .default(100),
});

/**
 * Announcements settings
 */
export type Settings = z.infer<typeof settingsSchema>;

/**
 * Announcements settings store operations
 */
export interface SettingsStore {
  getAll(): Settings;
  update(settings: Partial<Settings>): Promise<void>;
  reset(): Promise<void>;
}
