import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  configApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { authenticationApiRef } from './types/authentication/types';
import { AuthenticationClient } from './request/api/authentication';
import { TimeRegistrationApiRef } from './types/timeregistration/types';
import { TimeRegistrationClient } from './request/api/timeRegistration';

export const meeweeTimeRegistrationPlugin = createPlugin({
  id: 'meewee-time-registration',
  apis: [
    createApiFactory({
      api: authenticationApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: deps => new AuthenticationClient(deps),
    }),
    createApiFactory({
      api: TimeRegistrationApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: deps => new TimeRegistrationClient(deps),
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
