import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * resourceOptimizationPlugin backend plugin
 *
 * @public
 */
export const resourceOptimizationPlugin = createBackendPlugin({
  pluginId: 'redhat-resource-optimization',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, config }) {
        const router = await createRouter({
          logger,
          config,
        });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/token',
          allow: 'user-cookie',
        });
      },
    });
  },
});
