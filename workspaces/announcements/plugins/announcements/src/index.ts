export * from './plugin';

import {
  announcementsApiRef as announcementsApiRef_,
  AnnouncementsApi as AnnouncementsApi_,
} from '@backstage-community/plugin-announcements-react';

/**
 * @deprecated Use `AnnouncementsApi` from `@backstage-community/plugin-announcements-react` instead
 */
export type AnnouncementsApi = AnnouncementsApi_;

/**
 * @public
 * @deprecated Use `announcementsApiRef` from `@backstage-community/plugin-announcements-react` instead
 */
export const announcementsApiRef = announcementsApiRef_;
