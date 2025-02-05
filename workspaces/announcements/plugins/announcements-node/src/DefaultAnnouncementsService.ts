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
  AnnouncementRequestOptions,
  AnnouncementsService,
} from './AnnouncementsService';
import { ResponseError } from '@backstage/errors';
import { DiscoveryService } from '@backstage/backend-plugin-api';
import {
  Announcement,
  AnnouncementsList,
} from '@backstage-community/plugin-announcements-common';

/**
 * Configuration options for an AnnouncementsService
 *
 * @public
 */
export type AnnouncementsServiceOptions = {
  discovery: DiscoveryService;
};

/**
 * Default backend implementation of the AnnouncementsService
 *
 * @public
 */
export class DefaultAnnouncementsService implements AnnouncementsService {
  private readonly discovery: DiscoveryService;

  /**
   * Creates the default instance of AnnouncementsService
   *
   * @param opts - Configuration options for the announcements service
   * @returns A new DefaultAnnouncementsService instance
   */
  static create(opts: AnnouncementsServiceOptions) {
    return new DefaultAnnouncementsService(opts);
  }

  constructor(opts: AnnouncementsServiceOptions) {
    this.discovery = opts.discovery;
  }

  private async fetch<T = any>(
    input: string,
    options?: AnnouncementRequestOptions,
  ): Promise<T> {
    const baseApiUrl = await this.discovery.getBaseUrl('announcements');

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

  /**
   * Fetches a list of announcements
   */
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
