import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { TimeSaverProcessor } from './processor/TimeSaverProcessor';

export const catalogModuleTimeSaverProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'time-saver-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, catalog }) {
        logger.info('TimeSaver Catalog Processor ready.');
        catalog.addProcessor(new TimeSaverProcessor(logger));
      },
    });
  },
});
