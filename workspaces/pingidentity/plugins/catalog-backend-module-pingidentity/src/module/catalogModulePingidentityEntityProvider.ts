import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PingIdentityEntityProvider } from '../providers/PingIdentityEntityProvider';
import { GroupTransformer, UserTransformer } from '../lib/types';
import { pingIdentityTransformerExtensionPoint } from '../extensions';

/**
 * Registers the `PingIdentityEntityProvider` with the catalog processing extension point.
 *
 * @alpha
 */
export const catalogModulePingidentityEntityProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'pingidentity',
  register(reg) {
    let userTransformer: UserTransformer | undefined;
    let groupTransformer: GroupTransformer | undefined;

    reg.registerExtensionPoint(pingIdentityTransformerExtensionPoint, {
      setUserTransformer(transformer) {
        if (userTransformer) {
          throw new Error('User transformer may only be set once');
        }
        userTransformer = transformer;
      },
      setGroupTransformer(transformer) {
        if (groupTransformer) {
          throw new Error('Group transformer may only be set once');
        }
        groupTransformer = transformer;
      },
    });
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
            userTransformer: userTransformer,
            groupTransformer: groupTransformer,
          }),
        );
      },
    });
  },
});
