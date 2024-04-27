import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { AzureDevOpsAnnotatorProcessor } from './processor';

/** @public */
export const catalogModuleAzureDevopsAnnotatorProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'azure-devops-annotator-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ catalog, config }) {
        catalog.addProcessor(AzureDevOpsAnnotatorProcessor.fromConfig(config));
      },
    });
  },
});
