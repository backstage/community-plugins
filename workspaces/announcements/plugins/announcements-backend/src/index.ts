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
export * from './service/router';
export { announcementsPlugin as default } from './plugin';
export { buildAnnouncementsContext } from './service/announcementsContextBuilder';

import { AnnouncementCollatorFactory as AnnouncementCollatorFactory_ } from '@backstage-community/plugin-search-backend-module-announcements';

/**
 * @public
 * @deprecated Use `AnnouncementCollatorFactory` from `@backstage-community/plugin-search-backend-module-announcements` instead
 */
export type AnnouncementCollatorFactory = AnnouncementCollatorFactory_;
