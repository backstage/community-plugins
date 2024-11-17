import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { MTAProvider } from './provider/MTAEntityProvider';
/**
 * A backend module that integrates with the catalog to provide MTA entities.
 */
/** @public */
export const catalogModuleMtaEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'mta-entity-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ config, catalog, logger, scheduler }) {
        catalog.addEntityProvider(
          MTAProvider.newProvider(config, logger, scheduler),
        );
      },
    });
  },
});
