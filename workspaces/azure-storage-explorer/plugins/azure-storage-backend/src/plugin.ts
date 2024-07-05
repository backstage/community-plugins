import { loggerToWinstonLogger } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

export const azureStoragePlugin = createBackendPlugin({
  pluginId: 'azurestorage',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter
      },
      async init({ config, logger, httpRouter }) {        
        httpRouter.use(
          await createRouter({
            logger: loggerToWinstonLogger(logger),
            config,
          }),
        );
      },
    });
  },
});