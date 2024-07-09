import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createOdoAction, createOdoInitAction } from './actions';

/**
 * @public
 * The Odo Module for the Scaffolder Backend
 */
export const odoModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'github',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        const odoConfig = config.getOptionalConfig('odo');

        scaffolder.addActions(
          createOdoAction({ odoConfig }),
          createOdoInitAction({ odoConfig }),
        );
      },
    });
  },
});
