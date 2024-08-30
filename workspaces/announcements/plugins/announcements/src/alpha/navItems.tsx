import { NavItemBlueprint } from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const announcementsNavItem = NavItemBlueprint.make({
  params: {
    title: 'Announcements',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    icon: NotificationsIcon,
  },
});

export default [announcementsNavItem];
