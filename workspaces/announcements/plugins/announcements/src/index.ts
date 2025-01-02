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
export * from './plugin';

import {
  announcementsApiRef as announcementsApiRef_,
  AnnouncementsApi as AnnouncementsApi_,
} from '@backstage-community/plugin-announcements-react';

/**
   @public
 * @deprecated Use `AnnouncementsApi` from `@backstage-community/plugin-announcements-react` instead
 */
export type AnnouncementsApi = AnnouncementsApi_;

/**
 * @public
 * @deprecated Use `announcementsApiRef` from `@backstage-community/plugin-announcements-react` instead
 */
export const announcementsApiRef = announcementsApiRef_;

export type { AnnouncementsTimelineProps } from './components';
export type { AnnouncementSearchResultProps } from './components';
