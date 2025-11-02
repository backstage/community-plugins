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
import { DateTime } from 'luxon';
import { createApiRef } from '@backstage/core-plugin-api';
import {
  CreateAnnouncementRequest,
  CreateCategoryRequest,
  CreateTagRequest,
} from './types';
import {
  Announcement,
  AnnouncementsList,
  Category,
  Tag,
} from '@backstage-community/plugin-announcements-common';

/**
 * @public
 */
export const announcementsApiRef = createApiRef<AnnouncementsApi>({
  id: 'plugin.announcements.service',
});

/**
 * API interface for managing announcements and categories.
 *
 * @public
 */
export interface AnnouncementsApi {
  announcements(opts: {
    max?: number;
    page?: number;
    category?: string;
    tags?: string[];
    active?: boolean;
    sortBy?: 'created_at' | 'start_at' | 'updated_at';
    order?: 'asc' | 'desc';
    current?: boolean;
  }): Promise<AnnouncementsList>;
  announcementByID(id: string): Promise<Announcement>;

  createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement>;
  updateAnnouncement(
    id: string,
    request: CreateAnnouncementRequest,
  ): Promise<Announcement>;
  deleteAnnouncementByID(id: string): Promise<void>;

  categories(): Promise<Category[]>;
  createCategory(request: CreateCategoryRequest): Promise<void>;
  deleteCategory(slug: string): Promise<void>;

  tags(): Promise<Tag[]>;
  createTag(request: CreateTagRequest): Promise<void>;
  deleteTag(slug: string): Promise<void>;

  lastSeenDate(): DateTime;
  markLastSeenDate(date: DateTime): void;
}
