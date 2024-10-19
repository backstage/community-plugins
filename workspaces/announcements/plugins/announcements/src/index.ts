export * from './plugin';

import {
  announcementsApiRef as announcementsApiRef_,
  AnnouncementsApi as AnnouncementsApi_,
} from '@backstage/community-plugins/backstage-plugin-announcements-react';

/**
 * @deprecated Use `AnnouncementsApi` from `@backstage/community-plugins/backstage-plugin-announcements-react` instead
 */
export type AnnouncementsApi = AnnouncementsApi_;

/**
 * @public
 * @deprecated Use `announcementsApiRef` from `@backstage/community-plugins/backstage-plugin-announcements-react` instead
 */
export const announcementsApiRef = announcementsApiRef_;
