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

export interface Settings {
  maxPerPage: number;
  showInactiveAnnouncements: boolean;
}

export interface SettingsStore {
  get(): Promise<Settings>;
  update(settings: Partial<Settings>): Promise<void>;
  reset(): Promise<void>;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: Settings = {
  maxPerPage: 10,
  showInactiveAnnouncements: false,
};

/**
 * Zod schema for Settings validation
 * Validates maxPerPage as a positive integer between 1 and 100
 * Validates showInactiveAnnouncements as a boolean
 */
export const settingsSchema = z.object({
  maxPerPage: z
    .number()
    .int('maxPerPage must be an integer')
    .positive('maxPerPage must be a positive number')
    .min(1, 'maxPerPage must be at least 1')
    .max(100, 'maxPerPage must not exceed 100')
    .default(DEFAULT_SETTINGS.maxPerPage),
  showInactiveAnnouncements: z
    .boolean({
      required_error: 'showInactiveAnnouncements is required',
      invalid_type_error: 'showInactiveAnnouncements must be a boolean',
    })
    .default(DEFAULT_SETTINGS.showInactiveAnnouncements),
});

/**
 * Zod schema for partial Settings updates
 * Allows updating individual settings fields
 */
export const partialSettingsSchema = settingsSchema.partial();

/**
 * Type inferred from the settings schema
 */
export type SettingsInput = z.infer<typeof settingsSchema>;
