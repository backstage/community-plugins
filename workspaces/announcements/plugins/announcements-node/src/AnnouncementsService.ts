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
import {
  createServiceFactory,
  createServiceRef,
  coreServices,
} from '@backstage/backend-plugin-api';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import { DefaultAnnouncementsService } from './DefaultAnnouncementsService';

/**
 * Options for making announcement requests.
 *
 * @public
 */
export type AnnouncementRequestOptions = {
  token?: string;
};

/**
 * Service responsible for managing announcements.
 *
 * @public
 */
export interface AnnouncementsService {
  /**
   * Fetches announcements from the backend.
   */
  announcements(options?: AnnouncementRequestOptions): Promise<Announcement[]>;
}

/**
 * Reference to the Announcements Service, providing functionality for managing announcements.
 *
 * @public
 *
 * @deprecated - Use announcementsServiceRef from '@backstage-community/plugin-announcements-node' instead
 */
export const announcementsService = createServiceRef<AnnouncementsService>({
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
