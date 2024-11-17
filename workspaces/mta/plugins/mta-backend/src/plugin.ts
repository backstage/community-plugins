import {
  coreServices,
  createBackendPlugin,
  HttpRouterServiceAuthPolicy,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/** @public */
export const mtaPlugin = createBackendPlugin({
  pluginId: 'mta',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        config: coreServices.rootConfig,
        database: coreServices.database,
        userInfo: coreServices.userInfo,
        cache: coreServices.cache,
      },
      async init({
        logger,
        httpRouter,
        httpAuth,
        config,
        database,
        userInfo,
        cache,
      }) {
        logger.info(`Url: ${config.getString('mta.url')}`);

        const policyConfig: HttpRouterServiceAuthPolicy = {
          path: '/api/mta/cb/:rest',
          allow: 'unauthenticated',
        };
        httpRouter.use(
          await createRouter({
            logger,
            cache,
            httpAuth,
            database,
            config,
            userInfo,
          }),
        );
        httpRouter.addAuthPolicy(policyConfig);
      },
    });
  },
});
