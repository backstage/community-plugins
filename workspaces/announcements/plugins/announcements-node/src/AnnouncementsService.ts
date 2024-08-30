import {
  createServiceFactory,
  createServiceRef,
  coreServices,
} from '@backstage/backend-plugin-api';
import { Announcement } from '@procore-oss/backstage-plugin-announcements-common';
import { DefaultAnnouncementsService } from './DefaultAnnouncementsService';

/** @public */
export type AnnouncementRequestOptions = {
  token?: string;
};

/** @public */
export interface AnnouncementsService {
  /**
   * Fetches announcements from the backend.
   */
  announcements(options?: AnnouncementRequestOptions): Promise<Announcement[]>;
}

/** @public */
export const announcementsService = createServiceRef<AnnouncementsService>({
  id: 'announcements.service',
  scope: 'plugin',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        discoveryApi: coreServices.discovery,
      },
      factory({ discoveryApi }) {
        return DefaultAnnouncementsService.create({
          discoveryApi,
        });
      },
    }),
});
