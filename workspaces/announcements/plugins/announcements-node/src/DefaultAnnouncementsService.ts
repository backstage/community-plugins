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
  Announcement,
  AnnouncementsList,
} from '@procore-oss/backstage-plugin-announcements-common';
import {
  AnnouncementRequestOptions,
  AnnouncementsService,
} from './AnnouncementsService';
import { ResponseError } from '@backstage/errors';
import { DiscoveryService } from '@backstage/backend-plugin-api';

type AnnouncementsServiceOptions = {
  discoveryApi: DiscoveryService;
};

export class DefaultAnnouncementsService implements AnnouncementsService {
  private readonly discoveryApi: DiscoveryService;

  static create(opts: AnnouncementsServiceOptions) {
    return new DefaultAnnouncementsService(opts);
  }

  constructor(opts: AnnouncementsServiceOptions) {
    this.discoveryApi = opts.discoveryApi;
  }

  private async fetch<T = any>(
    input: string,
    options?: AnnouncementRequestOptions,
  ): Promise<T> {
    const baseApiUrl = await this.discoveryApi.getBaseUrl('announcements');

    return fetch(`${baseApiUrl}${input}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.token && { Authorization: `Bearer ${options?.token}` }),
      },
    }).then(async response => {
      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }
      return response.json() as Promise<T>;
    });
  }

  async announcements(
    options?: AnnouncementRequestOptions,
  ): Promise<Announcement[]> {
    const { results } = await this.fetch<AnnouncementsList>(
      '/announcements',
      options,
    );
    return results;
  }
}
