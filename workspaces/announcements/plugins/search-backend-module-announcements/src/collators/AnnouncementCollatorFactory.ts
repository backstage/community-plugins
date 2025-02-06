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
import { Readable } from 'stream';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { DefaultAnnouncementsService } from '@backstage-community/plugin-announcements-node';
import { Announcement } from '@backstage-community/plugin-announcements-common';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';

/**
 * Indexable document for announcements.
 *
 * @public
 */
export type IndexableAnnouncementDocument = IndexableDocument & {
  excerpt: string;
  createdAt: string;
};

/**
 * Options for {@link AnnouncementCollatorFactory}
 *
 * @public
 */
export type AnnouncementCollatorOptions = {
  logger: LoggerService;
  discoveryApi: DiscoveryService;
  auth: AuthService;
};

/**
 * Search collator responsibile for indexing announcements.
 *
 * @public
 */
export class AnnouncementCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'announcements';

  private readonly logger: LoggerService;
  private readonly announcementsClient: DefaultAnnouncementsService;
  private readonly auth: AuthService;

  static fromConfig(options: AnnouncementCollatorOptions) {
    return new AnnouncementCollatorFactory(options);
  }

  private constructor(options: AnnouncementCollatorOptions) {
    this.logger = options.logger;
    this.announcementsClient = new DefaultAnnouncementsService({
      discovery: options.discoveryApi,
    });
    this.auth = options.auth;
  }

  async getCollator() {
    return Readable.from(this.execute());
  }

  private async *execute(): AsyncGenerator<IndexableAnnouncementDocument> {
    this.logger.info('indexing announcements');

    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'announcements',
    });

    const results = await this.announcementsClient.announcements({ token });

    this.logger.debug(`got ${results.length} announcements`);

    for (const result of results) {
      yield this.getDocumentInfo(result);
    }
  }

  private getDocumentInfo(
    announcement: Announcement,
  ): IndexableAnnouncementDocument {
    this.logger.debug(
      `mapping announcement ${announcement.id} to indexable document`,
    );

    return {
      title: announcement.title,
      text: announcement.body,
      excerpt: announcement.excerpt,
      createdAt: announcement.created_at,
      location: `/announcements/view/${announcement.id}`,
    };
  }
}
