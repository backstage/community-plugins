import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { BlackDuckConfig } from './service/BlackDuckConfig';
import { createRouter } from './service/router';

/**
 * blackduckPlugin backend plugin
 *
 * @public
 */
export const blackduckPlugin = createBackendPlugin({
  pluginId: 'blackduck',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        permissions: coreServices.permissions,
        discovery: coreServices.discovery,
        httpAuth: coreServices.httpAuth,
      },
      async init({
        httpRouter,
        logger,
        config,
        permissions,
        discovery,
        httpAuth,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
            permissions,
            discovery,
            httpAuth,
            blackDuckConfig: BlackDuckConfig.fromConfig(config),
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
