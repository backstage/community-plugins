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

/**
 * Represents a category for organizing announcements
 *
 * @public
 */
export type Category = {
  /** Unique identifier for the category */
  slug: string;
  /** Display name of the category */
  title: string;
};

/**
 * Represents an announcement
 *
 * @public
 */
export type Announcement = {
  /** Unique identifier for the announcement */
  id: string;
  /** Optional category the announcement belongs to */
  category?: Category;
  /** The user that published the announcement */
  publisher: string;
  /** Title of the announcement */
  title: string;
  /** Short summary of the announcement */
  excerpt: string;
  /** Full content of the announcement */
  body: string;
  /** Timestamp when the announcement was created */
  created_at: string;
  /** Whether the announcement is currently active */
  active: boolean;
};

/**
 * Response structure for a list of announcements
 *
 * @public
 */
export type AnnouncementsList = {
  /** Total number of announcements */
  count: number;
  /** Array of announcement items */
  results: Announcement[];
};

/**
 * Filter options for querying announcements
 *
 * @public
 */
export type AnnouncementsFilters = {
  /** Maximum number of items to return */
  max?: number;
  /** Number of items to skip */
  offset?: number;
  /** Filter by category slug */
  category?: string;
  /** Page number for pagination */
  page?: number;
  /** Filter by active status */
  active?: boolean;
};

/**
 * Structure for announcement signal events
 *
 * @public
 */
export type AnnouncementSignal = {
  /** The announcement data */
  data: Announcement;
};
