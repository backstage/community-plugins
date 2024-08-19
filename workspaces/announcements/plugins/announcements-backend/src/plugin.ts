import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import { initializePersistenceContext } from './service/persistence/persistenceContext';
import { loggerToWinstonLogger } from '@backstage/backend-common';

export const announcementsPlugin = createBackendPlugin({
  pluginId: 'announcements',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        http: coreServices.httpRouter,
        permissions: coreServices.permissions,
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
      },
      async init({ http, logger, permissions, database, httpAuth }) {
        http.use(
          await createRouter({
            permissions: permissions,
            logger: loggerToWinstonLogger(logger),
            persistenceContext: await initializePersistenceContext(database),
            httpAuth: httpAuth,
          }),
        );
      },
    });
  },
});
