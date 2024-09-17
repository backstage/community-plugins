import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createBlackduckProjectAction } from './actions';
import { BlackDuckConfig } from '@backstage-community/plugin-blackduck-backend';

/**
 * @public
 */
export const scaffolderModuleBlackduckModule = createBackendModule({
  moduleId: 'scaffolder:backend:module:blackduck',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ scaffolderActions, config, logger }) {
        const blackDuckConfig = BlackDuckConfig.fromConfig(config);
        scaffolderActions.addActions(
          createBlackduckProjectAction(blackDuckConfig, logger),
        );
      },
    });
  },
});
