import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * mendPlugin backend plugin
 *
 * @public
 */
export const mendPlugin = createBackendPlugin({
  pluginId: 'mend',
  register(env) {
    env.registerInit({
      deps: {
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        permissions: coreServices.permissions,
      },
      async init({
        auth,
        config,
        discovery,
        httpAuth,
        httpRouter,
        logger,
        permissions,
      }) {
        httpRouter.use(
          await createRouter({
            auth,
            config,
            discovery,
            httpAuth,
            logger,
            permissions,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
