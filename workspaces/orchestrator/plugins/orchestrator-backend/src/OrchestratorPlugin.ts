import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';

import { createRouter } from './routerWrapper';

export const orchestratorPlugin = createBackendPlugin({
  pluginId: 'orchestrator',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
        scheduler: coreServices.scheduler,
        permissions: coreServices.permissions,
        httpAuth: coreServices.httpAuth,
        auth: coreServices.auth,
        catalogApi: catalogServiceRef,
      },
      async init({
        logger,
        config,
        discovery,
        httpRouter,
        catalogApi,
        urlReader,
        scheduler,
        permissions,
        httpAuth,
        auth,
      }) {
        const router = await createRouter({
          config: config,
          logger,
          discovery: discovery,
          catalogApi: catalogApi,
          urlReader: urlReader,
          scheduler: scheduler,
          permissions: permissions,
          httpAuth: httpAuth,
          auth: auth,
        });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/static/generated/envelope',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
