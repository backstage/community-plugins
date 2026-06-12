/*
 * Copyright 2025 The Backstage Authors
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
  createApiFactory,
  createComponentExtension,
  createPlugin,
  DiscoveryApi,
  discoveryApiRef,
  FetchApi,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { akeylessApiRef, AkeylessClient } from './api';

/**
 * The Akeyless plugin.
 * @public
 */
export const akeylessPlugin = createPlugin({
  id: 'akeyless',
  apis: [
    createApiFactory({
      api: akeylessApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({
        discoveryApi,
        fetchApi,
      }: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
      }) =>
        new AkeylessClient({
          discoveryApi,
          fetchApi,
        }),
    }),
  ],
});

/**
 * Card used to show Akeyless secrets linked to a catalog entity.
 * @public
 */
export const EntityAkeylessCard = akeylessPlugin.provide(
  createComponentExtension({
    name: 'EntityAkeylessCard',
    component: {
      lazy: () =>
        import('./components/EntityAkeylessCard').then(
          m => m.EntityAkeylessCard,
        ),
    },
  }),
);
