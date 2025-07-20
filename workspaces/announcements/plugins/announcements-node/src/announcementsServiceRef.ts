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

import {
  coreServices,
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { AnnouncementsService } from './AnnouncementsService';
import { DefaultAnnouncementsService } from './DefaultAnnouncementsService';

/**
 * Reference to a default implementation of the AnnouncementsService.
 *
 * @public
 */
export const announcementsServiceRef = createServiceRef<AnnouncementsService>({
  id: 'announcements.service',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        discovery: coreServices.discovery,
      },
      factory({ discovery }) {
        return DefaultAnnouncementsService.create({
          discovery,
        });
      },
    }),
});
