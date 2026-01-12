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
import {
  MAX_EXCERPT_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_TITLE_TAG_LENGTH,
} from './constants';

/**
 * Zod schema for announcements settings validation
 *
 * @public
 */
export const settingsSchema = z.object({
  pluginTitle: z.string().default('Announcements'),

  createAnnouncementAsInactive: z.boolean().default(false),
  sendNotification: z.boolean().default(false),
  createAnnouncementWithDefaultCategory: z.string().nullable(),

  showInactiveAnnouncements: z.boolean().default(false),
  showStartAt: z.boolean().default(false),

  announcementTitleLength: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(
      MAX_TITLE_LENGTH,
      `announcementTitleLength must not exceed ${MAX_TITLE_LENGTH}`,
    )
    .default(30),
  tagTitleLength: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(
      MAX_TITLE_TAG_LENGTH,
      `tagTitleLength must not exceed ${MAX_TITLE_TAG_LENGTH}`,
    )
    .default(20),
  excerptLength: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(
      MAX_EXCERPT_LENGTH,
      `excerptLength must not exceed ${MAX_EXCERPT_LENGTH}`,
    )
    .default(50),
  maxPerPage: z
    .number()
    .int()
    .positive()
    .min(1)
    .max(100, 'maxPerPage must not exceed 100')
    .default(10),
});
