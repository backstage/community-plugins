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
import { Announcement } from '@backstage-community/plugin-announcements-common';

/**
 * Request to create an announcement
 *
 * @public
 */
export type CreateAnnouncementRequest = Omit<
  Announcement,
  'id' | 'category' | 'tags' | 'created_at'
> & {
  category?: string;
  tags?: string[];
};

/**
 * Request to create a category
 *
 * @public
 */
export type CreateCategoryRequest = {
  title: string;
};

/**
 * Request to create a tag
 *
 * @public
 */
export type CreateTagRequest = {
  title: string;
};
