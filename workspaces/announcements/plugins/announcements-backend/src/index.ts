export * from './service/router';
export { announcementsPlugin as default } from './plugin';
export { buildAnnouncementsContext } from './service/announcementsContextBuilder';

import { AnnouncementCollatorFactory as AnnouncementCollatorFactory_ } from '@backstage-community/backstage-plugin-search-backend-module-announcements';

/**
 * @public
 * @deprecated Use `AnnouncementCollatorFactory` from `@backstage-community/backstage-plugin-search-backend-module-announcements` instead
 */
export type AnnouncementCollatorFactory = AnnouncementCollatorFactory_;
