import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './service/router';

/**
 * The report-portal backend plugin.
 * @packageDocumentation
 * @public
 */
export const reportPortalPlugin = createBackendPlugin({
  pluginId: 'report-portal',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ config, logger, http }) {
        http.use(
          await createRouter({
            config: config,
            logger: logger,
          }),
        );
      },
    });
  },
});
