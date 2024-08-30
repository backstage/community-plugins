// plugins/example-backend/src/plugin.ts
// import { MTAProvider } from '../../catalog-backend-module-mta/src/provider/MTAEntityProvider';

// eslint-disable-next-line @backstage/no-relative-monorepo-imports
// import { MTAProvider } from '../../catalog-backend-module-mta/src/provider/MTAEntityProvider';

// import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import {
  coreServices,
  createBackendPlugin,
  // createBackendModule,
  // HttpRouterService,
  HttpRouterServiceAuthPolicy,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';
import {
  cacheToPluginCacheManager,
  loggerToWinstonLogger,
} from '@backstage/backend-common';

export const mtaPlugin = createBackendPlugin({
  pluginId: 'mta',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
        database: coreServices.database,
        identity: coreServices.identity,
        cache: coreServices.cache,
      },
      async init({ logger, httpRouter, config, database, identity, cache }) {
        logger.info('Hello from example plugin');
        const winstonLogger = loggerToWinstonLogger(logger);

        winstonLogger.info(`Url: ${config.getString('mta.url')}`);

        const pluginCacheManager = cacheToPluginCacheManager(cache);
        // http.addAuthPolicy({ path: '/api/mta/*', allow: 'unauthenticated' });
        const policyConfig: HttpRouterServiceAuthPolicy = {
          path: '/api/mta/cb/:rest',
          allow: 'unauthenticated',
        };
        httpRouter.use(
          await createRouter({
            logger: winstonLogger,
            cache: pluginCacheManager,
            database,
            config,
            identity,
          }),
        );
        httpRouter.addAuthPolicy(policyConfig);

        // httpRouter.use((req, res, next) => {
        //   if (req.path.startsWith('/api/mta/cb/:username')) {
        //     // Bypassing authentication for specific callback route
        //     next();
        //   } else {
        //     // Apply authentication middleware
        //     // authenticateRequest(req, res, next);
        //   }
        // });

        // function authenticateRequest(req, res, next) {
        //   const token = req.headers.authorization?.split(' ')[1];
        //   if (!token) {
        //     return res.status(401).json({ error: 'No token provided' });
        //   }
        //   // Proceed with token verification and identity setting
        //   verifyToken(token, identity, (err) => {
        //     if (err) {
        //       return res.status(401).json({ error: 'Unauthorized' });
        //     }
        //     next();
        //   });
      },
    });
  },
});
