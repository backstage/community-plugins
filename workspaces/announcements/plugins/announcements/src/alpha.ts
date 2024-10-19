import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { announcementsApiExtension } from './alpha/apis';
import { entityAnnouncementsCard } from './alpha/entityCards';
import { announcementsNavItem } from './alpha/navItems';
import { announcementsPage } from './alpha/pages';
import { rootRouteRef } from './routes';

/**
 * @alpha
 */
export default createFrontendPlugin({
  id: 'announcements',
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
  extensions: [
    announcementsApiExtension,
    entityAnnouncementsCard,
    announcementsPage,
    announcementsNavItem,
  ],
}) as FrontendPlugin;
