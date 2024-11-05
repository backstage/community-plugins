import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createMTAApplicationAction } from './actions/mta/create-application';
import { loggerToWinstonLogger } from '@backstage/backend-common';
/*
 * A backend module that integrates with the scaffolder to provide MTA application creation.
 */
/** @public */
export const mtaScaffolderModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'mta',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
      },
      async init({ scaffolder, config, logger, discovery }) {
        const createAction = createMTAApplicationAction({
          config: config,
          logger: loggerToWinstonLogger(logger),
          discovery,
        });
        scaffolder.addActions(createAction);
      },
    });
  },
});
