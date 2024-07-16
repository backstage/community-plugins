import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { LinguistTagsProcessor } from './processor';

/** @public */
export const catalogModuleLinguistTagsProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'linguist-tags-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ catalog, config, logger, discovery, auth }) {
        catalog.addProcessor(
          LinguistTagsProcessor.fromConfig(config, { logger, discovery, auth }),
        );
      },
    });
  },
});
