import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { ScaffolderRelationEntityProcessor } from './ScaffolderRelationEntityProcessor';

/**
 * Catalog processor that adds link relation between scaffolder templates and their generated entities
 *
 * @public
 */
export const catalogModuleScaffolderRelationProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'scaffolder-relation-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ catalog, logger }) {
        logger.debug(
          'Registering the scaffolder-relation-processor catalog module',
        );
        catalog.addProcessor(new ScaffolderRelationEntityProcessor());
      },
    });
  },
});
