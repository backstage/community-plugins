import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PingIdentityEntityProvider } from '../providers/PingIdentityEntityProvider';

/**
 * Registers the `PingIdentityEntityProvider` with the catalog processing extension point.
 *
 * @alpha
 */
export const catalogModulePingidentityEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'pingidentity',
  register(reg) {
    reg.registerInit({
      deps: { 
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, logger, scheduler }) {
        catalog.addEntityProvider(
          PingIdentityEntityProvider.fromConfig(config, {
            id: 'development',
            logger,
            scheduler,
          }),
        );
      },
    });
  },
});
