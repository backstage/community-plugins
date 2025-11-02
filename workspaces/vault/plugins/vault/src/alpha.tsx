/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

import { isVaultAvailable } from './conditions';
import { vaultApiRef, VaultClient } from './api';

/**
 * An API to communicate with the Vault backend.
 *
 * @alpha
 */
export const vaultApi = ApiBlueprint.make({
  name: 'vaultApi',
  params: defineParams =>
    defineParams({
      api: vaultApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({
        discoveryApi,
        fetchApi,
      }: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
      }) =>
        new VaultClient({
          discoveryApi,
          fetchApi,
        }),
    }),
});

/**
 * A catalog entity content (tab) that shows the Vault secrets.
 *
 * @alpha
 */
export const vaultEntityContent: any = EntityContentBlueprint.make({
  name: 'vaultEntityContent',
  params: {
    path: 'vault',
    title: 'Vault',
    filter: isVaultAvailable,
    loader: () =>
      import('./components/EntityVaultCard').then(m => <m.EntityVaultCard />),
  },
});

/**
 * Backstage frontend plugin.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'vault',
  extensions: [vaultApi, vaultEntityContent],
});
