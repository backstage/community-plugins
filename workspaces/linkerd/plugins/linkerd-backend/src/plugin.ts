import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * linkerdPlugin backend plugin
 *
 * @public
 */
export const linkerdPlugin = createBackendPlugin({
  pluginId: 'linkerd',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        auth: coreServices.auth,
        httpAuth: coreServices.httpAuth,
        discovery: coreServices.discovery,
      },
      async init({ httpRouter, logger, auth, httpAuth, discovery }) {
        httpRouter.use(
          await createRouter({
            logger,
            auth,
            httpAuth,
            discovery,
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
