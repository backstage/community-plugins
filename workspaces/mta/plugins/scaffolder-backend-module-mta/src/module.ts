import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createMTAApplicationAction } from './actions/mta/create-application';

/**
 * A backend module that integrates with the scaffolder to provide MTA application creation.
 * Requires mta.providerAuth.clientID and mta.providerAuth.secret to be configured.
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
      },
      async init({ scaffolder, config, logger }) {
        const createAction = createMTAApplicationAction({
          config,
          logger,
        });
        scaffolder.addActions(createAction);
      },
    });
  },
});
