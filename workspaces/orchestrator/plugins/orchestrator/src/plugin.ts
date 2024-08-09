import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { orchestratorApiRef, OrchestratorClient } from './api';
import { orchestratorRootRouteRef } from './routes';

export const orchestratorPlugin = createPlugin({
  id: 'orchestrator',
  apis: [
    createApiFactory({
      api: orchestratorApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory({ discoveryApi, identityApi }) {
        return new OrchestratorClient({ discoveryApi, identityApi });
      },
    }),
  ],
  routes: {
    root: orchestratorRootRouteRef,
  },
});

export const OrchestratorPage = orchestratorPlugin.provide(
  createRoutableExtension({
    name: 'OrchestratorPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: orchestratorRootRouteRef,
  }),
);
