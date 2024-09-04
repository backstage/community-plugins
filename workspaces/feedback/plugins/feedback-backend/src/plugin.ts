import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

export const feedbackPlugin = createBackendPlugin({
  pluginId: 'feedback',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ logger, httpRouter, config, discovery, auth }) {
        httpRouter.use(
          await createRouter({
            logger: logger,
            config: config,
            discovery: discovery,
            auth: auth,
          }),
        );
      },
    });
  },
});
