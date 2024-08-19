import { Readable } from 'stream';
import { Logger } from 'winston';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import {
  DocumentCollatorFactory,
  IndexableDocument,
} from '@backstage/plugin-search-common';
import { DefaultAnnouncementsService } from '@procore-oss/backstage-plugin-announcements-node';
import { Announcement } from '@procore-oss/backstage-plugin-announcements-common';
import { AuthService } from '@backstage/backend-plugin-api';

type IndexableAnnouncementDocument = IndexableDocument & {
  excerpt: string;
  createdAt: string;
};

type AnnouncementCollatorOptions = {
  logger: Logger;
  discoveryApi: DiscoveryApi;
  auth: AuthService;
};

export class AnnouncementCollatorFactory implements DocumentCollatorFactory {
  public readonly type: string = 'announcements';

  private logger: Logger;
  private announcementsClient: DefaultAnnouncementsService;
  private auth: AuthService;

  static fromConfig(options: AnnouncementCollatorOptions) {
    return new AnnouncementCollatorFactory(options);
  }

  private constructor(options: AnnouncementCollatorOptions) {
    this.logger = options.logger;
    this.announcementsClient = new DefaultAnnouncementsService({
      discoveryApi: options.discoveryApi,
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
      // TODO this might not be correct
      location: `/announcements/view/${announcement.id}`,
    };
  }
}
