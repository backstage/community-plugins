import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createMTAApplicationAction } from './actions/mta/create-application';
import { loggerToWinstonLogger } from '@backstage/backend-common';

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
        identity: coreServices.identity,
      },
      async init({ scaffolder, config, logger, discovery, identity }) {
        const createAction = createMTAApplicationAction({
          config: config,
          logger: loggerToWinstonLogger(logger),
          discovery,
          identity,
        });
        scaffolder.addActions(createAction);
      },
    });
  },
});
