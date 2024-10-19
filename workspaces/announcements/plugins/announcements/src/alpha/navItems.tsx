import { NavItemBlueprint } from '@backstage/frontend-plugin-api';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { rootRouteRef } from '../routes';

/*

TODO: replace once `NavItemBlueprint.make()` supports mui v5
      remove @material-ui dep in package.json

*/
// import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsIcon from '@material-ui/icons/Notifications';

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
