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
 * Main topic for announcement events
 *
 * @public
 */
export const EVENTS_TOPIC_ANNOUNCEMENTS = 'announcements';

/**
 * Event action for creating an announcement
 *
 * @public
 */
export const EVENTS_ACTION_CREATE_ANNOUNCEMENT = 'create_announcement';

/**
 * Event action for updating an announcement
 *
 * @public
 */
export const EVENTS_ACTION_UPDATE_ANNOUNCEMENT = 'update_announcement';

/**
 * Event action for deleting an announcement
 *
 * @public
 */
export const EVENTS_ACTION_DELETE_ANNOUNCEMENT = 'delete_announcement';

/**
 * Event action for creating a category
 *
 * @public
 */
export const EVENTS_ACTION_CREATE_CATEGORY = 'create_category';

/**
 * Event action for deleting a category
 *
 * @public
 */
export const EVENTS_ACTION_DELETE_CATEGORY = 'delete_category';

/**
 * Event action for creating a tag
 *
 * @public
 */
export const EVENTS_ACTION_CREATE_TAG = 'create-tag';

/**
 * Event action for deleting a tag
 *
 * @public
 */
export const EVENTS_ACTION_DELETE_TAG = 'delete-tag';

/**
 * Channel name for new announcement signals
 *
 * @public
 */
export const SIGNALS_CHANNEL_ANNOUNCEMENTS = 'announcements:new';

/**
 * Maximum length for announcement tag title
 *
 * @public
 */
export const MAX_TITLE_TAG_LENGTH = 100;
