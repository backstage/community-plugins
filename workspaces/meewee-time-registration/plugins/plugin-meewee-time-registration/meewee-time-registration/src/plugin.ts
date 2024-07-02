import {
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  microsoftAuthApiRef,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { azDevopsApiRef } from './types/azdevops/types';
import { AzDevOpsClient } from './request/api/azdevops/AzDevOpsClient';

export const meeweeTimeRegistrationPlugin = createPlugin({
  id: 'meewee-time-registration',
  apis: [
    createApiFactory({
      api: azDevopsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        authApi: microsoftAuthApiRef,
        fetchApi: fetchApiRef,
      },
      factory: deps => new AzDevOpsClient(deps),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const MeeweeTimeRegistrationPage = meeweeTimeRegistrationPlugin.provide(
  createRoutableExtension({
    name: 'MeeweeTimeRegistrationPage',
    component: () => import('./App').then(m => m.default),
    mountPoint: rootRouteRef,
  }),
);
