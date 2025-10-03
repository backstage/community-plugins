import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';

import { NexusRepositoryManagerApiRef } from '../../src/api';
import nexusRepositoryManagerPlugin from '../../src/alpha';

import { catalogApi } from './catalogApiMock';
import { nexusRepositoryManagerApiMock } from './nexusRepositoryManagerMock';

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const nexusRepositoryManagerPluginOverrides =
  nexusRepositoryManagerPlugin.withOverrides({
    extensions: [
      nexusRepositoryManagerPlugin
        .getExtension('api:nexus-repository-manager')
        .override({
          params: defineParams =>
            defineParams({
              api: NexusRepositoryManagerApiRef,
              deps: {},
              factory: () => nexusRepositoryManagerApiMock,
            }),
        }),
    ],
  });

const app = createApp({
  features: [catalogPluginOverrides, nexusRepositoryManagerPluginOverrides],
});

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
