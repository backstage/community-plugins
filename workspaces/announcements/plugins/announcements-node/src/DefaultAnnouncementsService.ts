import {
  Announcement,
  AnnouncementsList,
} from '@backstage/community-plugins/backstage-plugin-announcements-common';
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
