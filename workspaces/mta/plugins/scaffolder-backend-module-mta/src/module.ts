import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createMTAApplicationAction } from './actions/mta/create-application';
import { loggerToWinstonLogger } from '@backstage/backend-common';

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
