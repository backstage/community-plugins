import { HostDiscovery } from '@backstage/backend-app-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import { CatalogClient } from '@backstage/catalog-client';

import { createRouter } from '../routerWrapper';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'orchestrator',
    createPlugin: async env => {
      const catalogApi = new CatalogClient({
        discoveryApi: HostDiscovery.fromConfig(env.config),
      });
      return createRouter({
        ...env,
        urlReader: env.reader,
        catalogApi,
      });
    },
  },
};
